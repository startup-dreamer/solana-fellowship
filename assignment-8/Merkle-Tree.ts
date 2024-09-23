import { generateSigner } from '@metaplex-foundation/umi';
import { createTree, DecompressibleState, findTreeConfigPda, setDecompressibleState } from '@metaplex-foundation/mpl-bubblegum';
import { createUmiInstance } from './utils';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import bs58 from "bs58";
import { base58 } from '@metaplex-foundation/umi/serializers';
import { toWeb3JsInstruction } from '@metaplex-foundation/umi-web3js-adapters';

import dotenv from 'dotenv';
import { Request, Response } from "express";

import { BASE_URL, connection } from './utils';

import { createResponsePayload, handleError, validatedQueryParams } from './utils';

dotenv.config();



export async function generateMerkleStructure(userPubkey: PublicKey, networkConnection: Connection) {
    const walletKeypair = Keypair.fromSecretKey(
        bs58.decode(
        process.env.SOLANA_PRIVATE_KEY || ""
        )
    );
    const umiEnvironment = createUmiInstance(walletKeypair);
    const treeStructure = generateSigner(umiEnvironment);
    console.log("treeStructure", treeStructure);
    let instructionBuilder = await createTree(umiEnvironment, {
        merkleTree: treeStructure,
        maxDepth: 5,
        maxBufferSize: 8,
        canopyDepth: 0,
        public: true,
    });

    instructionBuilder = instructionBuilder.append(
        setDecompressibleState(umiEnvironment, {
          treeConfig:
            findTreeConfigPda(umiEnvironment, { merkleTree: treeStructure.publicKey }),
          treeCreator: umiEnvironment.identity,
          decompressableState: DecompressibleState.Enabled,
        })
    );


    const transactionResult = await instructionBuilder.sendAndConfirm(umiEnvironment);

    const txSignature = base58.deserialize(transactionResult.signature)[0];

    console.log(
        "transaction: ",
        `https://translator.shyft.to/tx/${txSignature}?cluster=mainnet-beta`
    );


    const instructions = instructionBuilder.getInstructions().map(toWeb3JsInstruction);

    const txObject = new Transaction().add(...instructions);

    txObject.feePayer = new PublicKey(userPubkey);
    txObject.recentBlockhash = (await networkConnection.getLatestBlockhash()).blockhash;

    console.log("txObject", txObject.signature);

    return { treePublicKey: treeStructure.publicKey, txObject: txObject, walletKeypair: walletKeypair };
}

export async function fetchCreateMerkleTree(req: Request, res: Response): Promise<void> {
    try {
        const { toPubkey } = validatedQueryParams(req.query);
        const apiEndpoint = `${BASE_URL}/api/actions/create-merkle-tree?to=${toPubkey.toBase58()}`;

        res.json({
            title: "Create Merkle Tree",
            icon: "https://maroon-binding-lynx-58.mypinata.cloud/ipfs/QmSMSVFvm4gjsLXPihrFnM3CuzCBoeABZJVRWPq8wP9f8c",
            description: "Create a Merkle Tree on Solana",
            links: {
                actions: [
                  { 
                    label: "Create Merkle Tree",
                    href: apiEndpoint,
                  },
                ],
            },
        });
    } catch (err) {
        handleError(res, err, 500);
    }
}

export async function submitCreateMerkleTree(req: Request, res: Response): Promise<void> {
    try {
        console.log(req.body);
        const { account } = req.body;
        console.log("account:", account);
        if (!account) throw new Error('Invalid "account" provided');

        const userPublicKey = new PublicKey(account);

        const {treePublicKey, txObject, walletKeypair} = await generateMerkleStructure(userPublicKey, connection);
        console.log("Merkle Tree Public Key:", treePublicKey);

        const responseData = await createResponsePayload(txObject as unknown as Transaction, walletKeypair);

        res.json(responseData);


    } catch (err) {
        handleError(res, err, 400);
    }
}
