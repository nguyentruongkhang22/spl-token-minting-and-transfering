import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { createAssociatedTokenAccountInstruction, createInitializeAccountInstruction, createInitializeMintInstruction, getAssociatedTokenAddress, MINT_SIZE, TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { SplToken } from "../target/types/spl_token";
import { expect } from "chai";

describe("spl-token", () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    let associatedTokenAccount;

    const program = anchor.workspace.SplToken as Program<SplToken>;
    const mintKey = new anchor.web3.Keypair();

    it("Mint token", async () => {
        // Add your test here.
        const key = provider.wallet.publicKey;
        const lamports = await program.provider.connection.getMinimumBalanceForRentExemption(MINT_SIZE);

        associatedTokenAccount = await getAssociatedTokenAddress(
            mintKey.publicKey,
            key
        )
        const mint_tx = new anchor.web3.Transaction().add(
            anchor.web3.SystemProgram.createAccount({
                fromPubkey: key,
                newAccountPubkey: mintKey.publicKey,
                space: MINT_SIZE,
                programId: TOKEN_PROGRAM_ID,
                lamports
            }),

            createInitializeMintInstruction(mintKey.publicKey, 0, key, key),

            createAssociatedTokenAccountInstruction(key, associatedTokenAccount, key, mintKey.publicKey)
        )

        const res = await provider.sendAndConfirm(mint_tx, [mintKey]);

        const tx = await program.methods.mintToken().accounts({
            mint: mintKey.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            tokenAccount: associatedTokenAccount,
            authority: key
        }).rpc();

        // Get minted token amount on the ATA for our anchor wallet
        const minted = (await program.provider.connection.getParsedAccountInfo(associatedTokenAccount)).value.data.parsed.info.tokenAmount.amount;
        expect(parseInt(minted)).equal(10)
    });

    it('Transfer token', async function () {
        const myWallet = provider.wallet.publicKey;
        const toWallet = new anchor.web3.Keypair();

        const toATA = await getAssociatedTokenAddress(
            mintKey.publicKey,
            toWallet.publicKey
        )

        const tx = new anchor.web3.Transaction().add(
            createAssociatedTokenAccountInstruction(
                myWallet, toATA, toWallet.publicKey, mintKey.publicKey
            )
        )

        await provider.sendAndConfirm(tx, []);

        await program.methods.transferToken().accounts({
            tokenProgram: TOKEN_PROGRAM_ID,
            from: associatedTokenAccount,
            fromAuthority: myWallet,
            to: toATA
        }).rpc()

        // Get minted token amount on the ATA for our anchor wallet
        console.log((await program.provider.connection.getParsedAccountInfo(associatedTokenAccount)).value.data)
        const minted = (await program.provider.connection.getParsedAccountInfo(associatedTokenAccount)).value.data.parsed.info.tokenAmount.amount;
        expect(parseInt(minted)).equal(5);
    })
});
