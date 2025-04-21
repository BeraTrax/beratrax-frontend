import { Address, encodeAbiParameters, hexToBytes, keccak256 } from "viem";

// 4-byte allowance seed. In the EVM, it is zero-padded to 32 bytes on mstore.
const ALLOWANCE_SLOT_SEED = "0x7f5e9f20";
// 4-byte balance seed, zero-padded to 32 bytes by mstore in EVM
const BALANCE_SLOT_SEED = "0x87a211a2";

// Helper to replicate `mstore(offset, value)` by writing 32 bytes into `mem`.
function store(offset: number, valueHex: `0x${string}`, mem: Uint8Array) {
    // remove leading "0x" & left-pad to 64 hex chars (32 bytes)
    const hex = valueHex.replace(/^0x/, "").padStart(64, "0");
    const bytes = hexToBytes(`0x${hex}`);
    mem.set(bytes, offset);
}

export const getHoneyAllowanceSlot = (owner: `0x${string}`, spender: `0x${string}`) => {
    // 1. Allocate 64 bytes of zeroed memory (offsets 0..63).
    const mem = new Uint8Array(64).fill(0);

    // ------------------------------------------------------------------
    // Replicate the exact mstore order from the Solidity snippet:
    //   1) mstore(0x20, spender)
    //   2) mstore(0x0c, _ALLOWANCE_SLOT_SEED)
    //   3) mstore(0x00, owner)
    // ------------------------------------------------------------------

    // mstore(0x20, spender) => offsets [32..63]
    store(0x20, spender, mem);

    // mstore(0x0c, ALLOWANCE_SLOT_SEED) => offsets [12..43]
    store(0x0c, ALLOWANCE_SLOT_SEED, mem);

    // mstore(0x00, owner) => offsets [0..31]
    store(0x00, owner, mem);

    // Finally, take keccak256 of bytes [12..63] inclusive (which is slice(12, 64) in JS).
    const slice = mem.slice(12, 64);
    const hashBytes = keccak256(slice);

    return hashBytes;
};

export const getHoneyBalanceSlot = (owner: `0x${string}`) => {
    // 1. Allocate 64 bytes of zeroed memory (covers offsets 0..63).
    const mem = new Uint8Array(64).fill(0);

    // ---------------------------------------------------------------
    // Match the Solidity assembly order:
    //   mstore(0x0c, _BALANCE_SLOT_SEED)  -> offsets [12..43]
    //   mstore(0x00, owner)              -> offsets [0..31]
    //   keccak256(0x0c, 0x20)            -> hash [12..43]
    // ---------------------------------------------------------------

    // mstore(0x0c, _BALANCE_SLOT_SEED)
    store(0x0c, BALANCE_SLOT_SEED, mem);

    // mstore(0x00, owner)
    store(0x00, owner, mem);

    // 2. keccak256 of 32 bytes from offset 12..43 (inclusive)
    //    (In JS slice notation, slice(12, 44) is exactly 32 bytes.)
    const slice = mem.slice(12, 44);
    const hashBytes = keccak256(slice);

    return hashBytes;
};

export function getERC20BalanceSlot(owner: Address) {
    // Most OpenZeppelin ERC20 tokens store balances in slot 0
    const mappingSlot = 0n;
    
    // Encode the owner address and the mapping slot
    const encoded = encodeAbiParameters(
        [{ type: "address" }, { type: "uint256" }], 
        [owner, mappingSlot]
    );
    
    // Hash to get the actual storage slot
    return keccak256(encoded);
}

export function getERC20AllowanceSlot(owner: Address, spender: Address) {
    // Most OpenZeppelin ERC20 tokens store allowances in slot 1
    const mappingSlot = 1n;
    
    // First level of mapping (owner)
    const innerEncoded = encodeAbiParameters(
        [{ type: "address" }, { type: "uint256" }], 
        [owner, mappingSlot]
    );
    const innerHash = keccak256(innerEncoded);
    
    // Second level of mapping (spender)
    const finalEncoded = encodeAbiParameters(
        [{ type: "address" }, { type: "bytes32" }], 
        [spender, innerHash]
    );
    
    return keccak256(finalEncoded);
}
