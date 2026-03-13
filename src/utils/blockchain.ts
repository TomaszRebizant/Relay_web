// Simple Blockchain implementation for service history
// Each block contains immutable record of service/maintenance action

export interface ServiceRecord {
  timestamp: string
  action: 'maintenance' | 'repair' | 'inspection' | 'installation' | 'warranty_claim'
  description: string
  technician: string
  deviceId: string
  cost?: number
  parts?: string[]
}

export class Block {
  index: number
  timestamp: string
  data: ServiceRecord
  previousHash: string
  hash: string
  nonce: number

  constructor(index: number, timestamp: string, data: ServiceRecord, previousHash: string = '') {
    this.index = index
    this.timestamp = timestamp
    this.data = data
    this.previousHash = previousHash
    this.nonce = 0
    this.hash = this.calculateHash()
  }

  calculateHash(): string {
    // Simple hash function (in production use SHA-256)
    const dataString = JSON.stringify(this.data)
    const hashInput = `${this.index}${this.timestamp}${dataString}${this.previousHash}${this.nonce}`
    
    // Simple hash algorithm for demo purposes
    let hash = 0
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(64, '0')
  }

  mineBlock(difficulty: number = 2): void {
    // Simple proof of work - find hash starting with zeros
    const target = Array(difficulty + 1).join('0')
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++
      this.hash = this.calculateHash()
    }
    console.log(`Block mined: ${this.hash}`)
  }
}

export class Blockchain {
  chain: Block[]
  difficulty: number

  constructor() {
    this.chain = [this.createGenesisBlock()]
    this.difficulty = 2
  }

  createGenesisBlock(): Block {
    // First block in the chain (genesis block)
    return new Block(
      0,
      new Date().toISOString(),
      {
        timestamp: new Date().toISOString(),
        action: 'installation',
        description: 'Genesis Block - Initial device installation',
        technician: 'System',
        deviceId: 'GENESIS'
      },
      '0'
    )
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1]!
  }

  addBlock(data: ServiceRecord): Block {
    const previousBlock = this.getLatestBlock()
    const newBlock = new Block(
      this.chain.length,
      new Date().toISOString(),
      data,
      previousBlock.hash
    )
    newBlock.mineBlock(this.difficulty)
    this.chain.push(newBlock)
    return newBlock
  }

  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i]
      const previousBlock = this.chain[i - 1]

      if (!currentBlock || !previousBlock) continue

      // Verify current block hash
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        console.log(`Invalid hash at block ${currentBlock.index}`)
        return false
      }

      // Verify chain link
      if (currentBlock.previousHash !== previousBlock.hash) {
        console.log(`Invalid chain link at block ${currentBlock.index}`)
        return false
      }
    }
    return true
  }

  getServiceHistory(): Block[] {
    return this.chain.slice(1) // Skip genesis block
  }

  getDeviceHistory(deviceId: string): Block[] {
    return this.chain.filter(block => block.data.deviceId === deviceId && block.index > 0)
  }

  verifyIntegrity(): { valid: boolean; tamperedBlocks: number[] } {
    const tamperedBlocks: number[] = []
    
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i]
      const previousBlock = this.chain[i - 1]

      if (!currentBlock || !previousBlock) continue

      if (currentBlock.hash !== currentBlock.calculateHash() ||
          currentBlock.previousHash !== previousBlock.hash) {
        tamperedBlocks.push(currentBlock.index)
      }
    }

    return {
      valid: tamperedBlocks.length === 0,
      tamperedBlocks
    }
  }

  toJSON(): string {
    return JSON.stringify(this.chain, null, 2)
  }

  static fromJSON(json: string): Blockchain {
    const parsed = JSON.parse(json)
    const blockchain = new Blockchain()
    blockchain.chain = parsed.map((blockData: any) => {
      const block = new Block(
        blockData.index,
        blockData.timestamp,
        blockData.data,
        blockData.previousHash
      )
      block.hash = blockData.hash
      block.nonce = blockData.nonce
      return block
    })
    return blockchain
  }
}

// Helper function to create service record
export function createServiceRecord(
  action: ServiceRecord['action'],
  description: string,
  technician: string,
  deviceId: string,
  cost?: number,
  parts?: string[]
): ServiceRecord {
  return {
    timestamp: new Date().toISOString(),
    action,
    description,
    technician,
    deviceId,
    cost,
    parts
  }
}

// Export singleton instance for global use
export const globalBlockchain = new Blockchain()
