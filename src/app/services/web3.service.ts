import { Injectable, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { BrowserProvider, Contract, formatEther, JsonRpcProvider } from 'ethers';
import { NotifyModalComponent } from '../modal/notify-modal/notify-modal.component';
import StudentABI from '../../assets/abi/StudentABI.json';

declare let window: any;

@Injectable({ providedIn: 'root' })
export class Web3Service {
  private readProvider: JsonRpcProvider | null = null;
  private provider: BrowserProvider | null = null;
  private signer: any = null;
  private contract: any;

  private accountSubject = new BehaviorSubject<string>('');
  private balanceSubject = new BehaviorSubject<string>('0');
  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  private chainIdSubject = new BehaviorSubject<string>('0x38');
  private nativeSymbolSubject = new BehaviorSubject<string>('ETH');
  public isLoading$ = new BehaviorSubject<boolean>(false);

  private studentDataSubject = new BehaviorSubject<any>(null);
  public studentData$ = this.studentDataSubject.asObservable();
  get studentData(): any {
    return this.studentDataSubject.value;
  }
  set studentData(value: any) {
    this.studentDataSubject.next(value);
  }

  account$ = this.accountSubject.asObservable();
  balance$ = this.balanceSubject.asObservable();
  isConnected$ = this.isConnectedSubject.asObservable();
  chainId$ = this.chainIdSubject.asObservable();
  nativeSymbol$ = this.nativeSymbolSubject.asObservable();

  selectedChainId = '0x38';

  public chainConfig: Record<string, {
    symbol: string;
    name: string;
    shortName: string;
    logo: string;
    rpcUrls: string[];
    contractAddress: string;
    abi: any;
    blockExplorerUrls?: any;
  }> = {
      '0x38': {
        symbol: 'BNB',
        name: 'BNB Smart Chain',
        shortName: 'BSC Mainnet',
        logo: '/assets/images/logo/bnb.png',
        rpcUrls: ['https://bsc-dataseed1.binance.org'],
        contractAddress: '0xad666f16768abC21b93B2Af72B1724B2774515Aa',
        abi: StudentABI,
        blockExplorerUrls: ['https://bscscan.com'],
      },
      '0x61': {
        symbol: 'tBNB',
        name: 'BNB Smart Chain Testnet',
        shortName: 'BSC Testnet',
        logo: '/assets/images/logo/bnb.png',
        rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
        contractAddress: '0x3b9d96B1Cde75A5dA786823De14d18dC46133b53',
        abi: StudentABI,
        blockExplorerUrls: ['https://testnet.bscscan.com'],
      },
    };

  constructor(private ngZone: NgZone, public dialog: MatDialog) {
    this.initEthers();
  }

  private async initEthers() {
    this.selectedChainId = localStorage.getItem('selectedChainId') || '0x38';
    await this.refreshConnection();

    if (typeof window.ethereum !== 'undefined') {
      this.listenWalletEvents();
      this.provider = new BrowserProvider(window.ethereum);
      try {
        const network = await this.provider.getNetwork();
        const actualChainId = '0x' + network.chainId.toString(16).toLowerCase();
        if (this.chainConfig[actualChainId]) {
          this.selectedChainId = actualChainId;
          localStorage.setItem('selectedChainId', actualChainId);
          await this.refreshConnection();
        }
      } catch (e: any) {
        console.warn('Failed to fetch MetaMask network:', e.message);
      }

      try {
        const accounts = await this.provider.send('eth_accounts', []);
        if (accounts.length > 0) {
          await this.setAccount(accounts[0]);
        }
      } catch (e: any) {
        console.warn('Failed to fetch MetaMask accounts:', e.message);
      }
    } else {
      console.warn('MetaMask is not installed, using RPC provider for reads.');
    }
  }

  private listenWalletEvents() {
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      this.ngZone.run(() => {
        accounts.length ? this.setAccount(accounts[0]) : this.disconnectWallet();
      });
    });

    window.ethereum.on('chainChanged', async (chainId: string) => {
      this.ngZone.run(async () => {
        const formatted = chainId.toLowerCase();
        if (!this.chainConfig[formatted]) {
          this.showModal('Error', 'The network you selected is not supported. Please switch to a supported network.', 'error');
          this.disconnectWallet();
          return;
        }
        this.selectedChainId = formatted;
        localStorage.setItem('selectedChainId', formatted);
        await this.refreshConnection();
        try {
          const data = await this.getDataFunc(1, 1);
          console.log("Data reloaded after network change:", data);
        } catch (err) {
          console.error("Failed to reload data after network change:", err);
        }
      });
    });
  }

  private async refreshConnection() {
    const chain = this.chainConfig[this.selectedChainId];
    if (!chain) {
      console.error(`No chain config for chainId: ${this.selectedChainId}`);
      return;
    }

    this.chainIdSubject.next(this.selectedChainId);
    this.nativeSymbolSubject.next(chain.symbol);

    try {
      this.readProvider = new JsonRpcProvider(chain.rpcUrls[0]);
      this.contract = new Contract(chain.contractAddress, chain.abi, this.readProvider) as any;
    } catch (e: any) {
      console.error('Failed to initialize readProvider or contract:', e.message);
    }

    if (this.account) {
      await this.setAccount(this.account);
    }
  }

  private get account() {
    return this.accountSubject.value;
  }

  private async getSigner() {
    if (!this.provider) {
      throw new Error('No wallet connected. Please connect your wallet.');
    }
    const network = await this.provider.getNetwork();
    const actualChainId = '0x' + network.chainId.toString(16).toLowerCase();
    if (actualChainId !== this.selectedChainId) {
      throw new Error(`Wallet is on the wrong network. Please switch to ${this.chainConfig[this.selectedChainId].name}.`);
    }
    if (!this.signer) {
      this.signer = await this.provider.getSigner();
    }
    return this.signer;
  }

  async connectWallet(): Promise<boolean> {
    if (typeof window.ethereum === 'undefined') {
      this.handleNoMetamask();
      return false;
    }
    try {
      this.provider = new BrowserProvider(window.ethereum);
      const accounts = await this.provider.send('eth_requestAccounts', []);
      if (!accounts.length) throw new Error('No account found');

      const network = await this.provider.getNetwork();
      const actualChainId = '0x' + network.chainId.toString(16).toLowerCase();
      if (this.chainConfig[actualChainId] && actualChainId !== this.selectedChainId) {
        this.selectedChainId = actualChainId;
        localStorage.setItem('selectedChainId', actualChainId);
      }

      await this.refreshConnection();
      await this.setAccount(accounts[0]);

      if (actualChainId !== this.selectedChainId) {
        await this.switchNetwork(this.selectedChainId);
      }
      return true;
    } catch (e: any) {
      this.handleError(e, 'connectWallet');
      return false;
    }
  }

  private async setAccount(account: string) {
    this.accountSubject.next(account);
    this.isConnectedSubject.next(true);
    await this.getBalance(account);
  }

  disconnectWallet() {
    this.accountSubject.next('');
    this.balanceSubject.next('0');
    this.isConnectedSubject.next(false);
    this.signer = null;
    this.provider = null;
  }

  private async getBalance(account: string) {
    try {
      if (!this.readProvider) {
        throw new Error('readProvider is not initialized');
      }
      const balance = await this.readProvider.getBalance(account);
      this.balanceSubject.next(formatEther(balance));
    } catch (e: any) {
      console.error(`Error in getBalance for account ${account}:`, e.message);
      this.handleError(e, 'getBalance');
    }
  }

  async getTokenBalanceFunc(address: string) {
    try {
      return (await this.contract?.balanceOf(address))?.toString() ?? '0';
    } catch (e: any) {
      this.handleError(e, 'getTokenBalance');
      return '0';
    }
  }

  async checkInFunc(tokenId: number) {
    if (!tokenId) return this.showModal('Error', 'Invalid tokenId', 'error');
    if (this.isLoading$.value) return;

    try {
      this.isLoading$.next(true);
      const signer = await this.getSigner();
      const tx = await this.contract!.connect(signer).checkIn(tokenId);
      const receipt = await tx.wait();
      this.showModal('Success', `Check-in successful! Tx: ${receipt.hash}`, 'success');
    } catch (e: any) {
      this.handleError(e, 'checkIn');
    } finally {
      this.isLoading$.next(false);
    }
  }

  async switchNetwork(chainId: string): Promise<void> {
    const formatted = chainId.startsWith('0x') ? chainId.toLowerCase() : '0x' + parseInt(chainId).toString(16);
    if (!this.chainConfig[formatted]) throw new Error(`Chain ID ${formatted} not supported`);

    this.selectedChainId = formatted;
    this.chainIdSubject.next(formatted);
    localStorage.setItem('selectedChainId', formatted);

    await this.refreshConnection();

    try {
      const data = await this.getDataFunc(1, 1);
    } catch (err) {
      console.error('Failed to load data for chain', formatted, ':', err);
      this.showModal('Error', 'Failed to load data for the selected network.', 'error');
    }

    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: formatted }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          const net = this.chainConfig[formatted];
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: formatted,
                chainName: net.name,
                nativeCurrency: { name: net.symbol, symbol: net.symbol, decimals: 18 },
                rpcUrls: net.rpcUrls,
                blockExplorerUrls: net.blockExplorerUrls || [],
              }],
            });
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: formatted }],
            });
          } catch (addError: any) {
            console.warn('User rejected adding network, but read operations will use selected chain:', formatted);
            this.showModal('Error', 'You rejected adding the network. Data has been loaded, but transactions may fail if the wallet network doesn’t match.', 'warning');
          }
        } else {
          console.warn('Network switch failed, but read operations will use selected chain:', formatted);
          this.showModal('Error', 'Failed to switch network. Data has been loaded, but transactions may fail if the wallet network doesn’t match.', 'error');
        }
      }
    }
  }

  private handleNoMetamask() {
    if (this.isMobile()) {
      window.location.href = `https://metamask.app.link/dapp/${window.location.href}`;
    } else {
      this.showModal('Error', 'MetaMask not installed!', 'error', true, true, true);
    }
  }

  private handleError(error: any, context: string) {
    if (error.code === 'ACTION_REJECTED') {
      this.showModal('Error', 'User rejected request.', 'error');
    } else if (error.code === 'NETWORK_ERROR') {
      this.showModal('Error', 'Network error. Please retry.', 'error');
    } else {
      this.showModal('Error', error.message || 'Unknown error', 'error');
    }
  }

  private isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  async getDataFunc(pageNumber: number = 1, sort: number = 1) {
    try {
      const data: any = await this.contract?.getAllStudents(pageNumber, Number(sort));
      this.studentData = data.map((item: any) => {
        return {
          id: Number(item[0]),
          studentId: item[1],
          fullName: item[2],
          dateOfBirth: Number(item[3]),
          gender: item[4],
          permanentAddress: item[5],
          creator: item[6],
        };
      });
      return data;
    } catch (e: any) {
      this.studentData = [];
      return [];
    }
  }

  async deleteFunc(studentId: number) {
    if (!studentId) return this.showModal('Error', 'Invalid studentId', 'error');
    if (this.isLoading$.value) return;

    try {
      this.isLoading$.next(true);
      const signer = await this.getSigner();
      const tx = await this.contract!.connect(signer).deleteStudent(studentId);
      const receipt = await tx.wait();
      this.showModal('Success', `Remove successful! Tx: ${receipt.hash}`, 'success');
      await this.getDataFunc();
    } catch (e: any) {
      this.handleError(e, 'deleteStudent');
    } finally {
      this.isLoading$.next(false);
    }
  }

  async addStudentFunc(studentId: string, fullName: string, dateOfBirth: any, gender: string, permanentAddress: string) {
    if (!studentId) return this.showModal('Error', 'Invalid studentId', 'error');
    if (this.isLoading$.value) return;

    try {
      this.isLoading$.next(true);
      const signer = await this.getSigner();
      const tx = await this.contract!.connect(signer).addStudent(studentId, fullName, dateOfBirth, gender, permanentAddress);
      const receipt = await tx.wait();
      this.showModal('Success', `Add successful! Tx: ${receipt.hash}`, 'success');
      await this.getDataFunc();
    } catch (e: any) {
      this.handleError(e, 'deleteStudent');
    } finally {
      this.isLoading$.next(false);
    }
  }

  async updateStudentFunc(id: string, studentId: string, fullName: string, dateOfBirth: any, gender: string, permanentAddress: string) {
    if (!studentId) return this.showModal('Error', 'Invalid studentId', 'error');
    if (this.isLoading$.value) return;

    try {
      this.isLoading$.next(true);
      const signer = await this.getSigner();
      const tx = await this.contract!.connect(signer).updateStudent(id, studentId, fullName, dateOfBirth, gender, permanentAddress);
      const receipt = await tx.wait();
      this.showModal('Success', `Add successful! Tx: ${receipt.hash}`, 'success');
      await this.getDataFunc();
    } catch (e: any) {
      this.handleError(e, 'deleteStudent');
    } finally {
      this.isLoading$.next(false);
    }
  }

  showModal(title: string, message: string, status: string,
    showCloseBtn = true, disableClose = true, installMetamask = false) {
    this.dialog.closeAll();
    this.dialog.open(NotifyModalComponent, {
      disableClose,
      width: '90%',
      maxWidth: '400px',
      data: { title, message, status, showCloseBtn, installMetamask },
    });
  }
}