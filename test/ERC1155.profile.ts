import { expect, BigNumber } from './utils'
import { profiler } from './utils/profiler';
import { provider as providerProfiler} from './utils/web3_wrapper';
import * as utils from './utils'

const ERC1155Mock = artifacts.require('ERC1155Mock')
const ERC1155Receiver = artifacts.require('ERC1155ReceiverMock')

// init test wallets from package.json mnemonic
const web3 = (global as any).web3

const {
  wallet: ownerWallet,
  provider: ownerProvider,
  signer: ownerSigner
} = utils.createTestWallet(web3, 0)

const {
  wallet: receiverWallet,
  provider: receiverProvider,
  signer: receiverSigner
} = utils.createTestWallet(web3, 2)

const {
  wallet: operatorWallet,
  provider: operatorProvider,
  signer: operatorSigner
} = utils.createTestWallet(web3, 4)

contract('ERC1155Mock', (accounts: string[]) => {

  let ownerAddress: string
  let operatorAddress: string
  let erc1155Contract: any
  let receiverContract: any

  before(async () => {
    ownerAddress = await ownerWallet.getAddress()
    operatorAddress = await operatorWallet.getAddress()
  })

  beforeEach(async () => {
    // Set provider to profiler
    ERC1155Mock.setProvider(providerProfiler);

    // Deploy ERC1155 contract
    erc1155Contract = await ERC1155Mock.new({ownerAddress})

    // Set provider
    ERC1155Receiver.setProvider(providerProfiler)

    // Deploy receiver contract
    receiverContract = await ERC1155Receiver.new({from : ownerAddress})
  })

  describe('safeTransferFrom() function', () => {
    
    beforeEach(async () => {
      // Mint tokens to owner
      await erc1155Contract.mockMint(ownerAddress, 0, 256, {from: ownerAddress})
    })

    it('when calling receiver contract with data', async () => {
      // data
      const data = web3.utils.asciiToHex('hello')

      // Start profiler
      profiler.start();

      // Execute function to profile
      await erc1155Contract.safeTransferFrom(ownerAddress, receiverContract.address, 0, 1, data, {from : ownerAddress})

      // Stop profiler
      profiler.stop();
    })

  })

  describe('safeBatchTransferFrom() function', () => {

    let types: any[], values: any[]
    let nTokenTypes    = 100
    let nTokensPerType = 10

    beforeEach(async () => {
      types  = [], values = []

      // Minting enough values for transfer for each types
      for (let i = 0; i < nTokenTypes; i++) {
        await erc1155Contract.mockMint(ownerAddress, i, nTokensPerType)
        types.push(i)
        values.push(nTokensPerType)
      }
    })

    it('should pass if valid response from receiver contract', async () => {
      // Junk data
      const data = web3.utils.asciiToHex('hello')

      // Start profiler
      profiler.start();

      // Batch Transfer
      await erc1155Contract.safeBatchTransferFrom(ownerAddress, receiverContract.address, types, values, data)
      
      // Stop profiler
      profiler.stop();
    })

  })

  describe('setApprovalForAll() function', () => {

    it('should emit an ApprovalForAll event', async () => {
      // Start profiler
      profiler.start()

      // Set approval
      await erc1155Contract.setApprovalForAll(operatorAddress, true)

      // Stop profiler
      profiler.stop()
    })
  })


})
