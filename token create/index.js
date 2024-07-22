import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, transfer } from '@solana/spl-token';

const from_secret = new Uint8Array([25,192,70,125,255,221,15,47,45,106,222,88,55,240,141,239,204,41,83,84,17,183,96,90,80,220,94,238,110,75,109,184,117,75,120,253,22,87,184,48,140,104,64,58,61,56,44,45,170,20,101,183,21,201,187,182,234,19,161,224,159,97,43,137]);
const to_secret = new Uint8Array([188,135,38,41,169,21,62,76,144,65,185,188,155,123,46,208,253,165,77,69,141,28,100,144,30,127,60,6,99,13,253,8,56,141,119,219,193,241,140,191,35,181,159,131,47,197,211,130,164,11,31,112,153,228,253,199,42,250,221,140,83,159,7,2]);


(async () => {
    // Step 1: Connect to cluster and generate a new Keypair
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const fromWallet = Keypair.fromSecretKey(from_secret);
    const toWallet = Keypair.fromSecretKey(to_secret);

    // Step 2: Airdrop SOL into your from wallet
    const fromAirdropSignature = await connection.requestAirdrop(fromWallet.publicKey, LAMPORTS_PER_SOL);
    // Wait for airdrop confirmation
    await connection.confirmTransaction(fromAirdropSignature, { commitment: "confirmed" });

    // Step 3: Create new token mint and get the token account of the fromWallet address
    //If the token account does not exist, create it
    const mint = await createMint(connection, fromWallet, fromWallet.publicKey, null, 9);
    console.log('mint address: ', mint.toBase58());
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet,
        mint,
        fromWallet.publicKey
)
    console.log('from token account address: ',fromTokenAccount.address.toString());
    
    //Step 4: Mint a new token to the from account
    let signature = await mintTo(
        connection,
        fromWallet,
        mint,
        fromTokenAccount.address,
        fromWallet.publicKey,
        100000000000,
        []
    );
    console.log('mint tx:', signature);

    //Step 5: Get the token account of the to-wallet address and if it does not exist, create it
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, toWallet.publicKey);
    console.log('to token account address: ', toTokenAccount.address.toString());

    //Step 6: Transfer the new token to the to-wallet's token account that was just created
    // Transfer the new token to the "toTokenAccount" we just created
    signature = await transfer(
        connection,
        fromWallet,
        fromTokenAccount.address,
        toTokenAccount.address,
        fromWallet.publicKey,
        1000000000,
        []
    );
    console.log('transfer tx:', signature);
})();