import { Keypair, PublicKey, Transaction, Connection } from "@solana/web3.js";
import { mintToCollectionV1, MetadataArgsArgs  } from "@metaplex-foundation/mpl-bubblegum";
import bs58 from "bs58";
import { generateSigner, publicKey, Umi } from '@metaplex-foundation/umi';
import { createUmiInstance } from "./utils";
import { toWeb3JsInstruction } from "@metaplex-foundation/umi-web3js-adapters";

import dotenv from 'dotenv';
import { Request, Response } from "express";
import { createResponsePayload, handleError, validatedQueryParams } from './utils';
import { BASE_URL, connection } from './utils';

dotenv.config();


export async function mintNFTCollectionHandler(userPubkey: PublicKey, networkConnection: Connection, collectionMint: PublicKey, recipientPubkeys: PublicKey[], treePubkey: PublicKey) {
    const walletKeypair = Keypair.fromSecretKey(
      bs58.decode(
        process.env.SOLANA_PRIVATE_KEY || ""
      )
    );
    console.log("walletKeypair", walletKeypair.publicKey);
    const umiInstance = createUmiInstance(walletKeypair);
  
    const transactionObject = new Transaction();
    
    for (const recipientPubkey of recipientPubkeys) {
      const mintSigner = generateSigner(umiInstance);
      console.log("mintSigner", mintSigner);
  
      console.log("recipientPubkey", recipientPubkey);
      const builder = await createCollectionBuilder(umiInstance, recipientPubkey, collectionMint, treePubkey, userPubkey);
      console.log("builder", builder);
      const instructions = await builder.getInstructions().map(toWeb3JsInstruction);
      console.log("instructions", instructions);
      transactionObject.add(...instructions);
      transactionObject.feePayer = new PublicKey(userPubkey);
      transactionObject.recentBlockhash = (await networkConnection.getLatestBlockhash()).blockhash;
      console.log("transactionObject", transactionObject);
    }
  
  
    transactionObject.feePayer = userPubkey;
    transactionObject.recentBlockhash = (await networkConnection.getLatestBlockhash()).blockhash;

    console.log("transactionObject", transactionObject);
  
    return { transactionObject, walletKeypair };
}

async function createCollectionBuilder(umi: Umi, recipientPubkey: PublicKey, collectionMint: PublicKey, treePubkey: PublicKey, userPubkey: PublicKey) {
  return mintToCollectionV1(umi, {
      leafOwner: publicKey(recipientPubkey),
      merkleTree: publicKey(treePubkey),
      collectionMint: publicKey(collectionMint),
      metadata: {
        name: "Sumit Kumar Collection",
        uri: "https://maroon-binding-lynx-58.mypinata.cloud/ipfs/QmUbVWjou4FwFDjfr4vW2DGWmWCizmbgtZ9JzvF2nL7s1Z",
        sellerFeeBasisPoints: 500,
        collection: {
          key: publicKey(collectionMint),
          verified: false,
        },
        creators: [ 
          {address: publicKey(userPubkey), verified: false, share: 100}
        ],
      } as MetadataArgsArgs,
    });
}


export async function getMintNFTCollectionHandler(req: Request, res: Response): Promise<void> {
    try {
      const { toPubkey } = validatedQueryParams(req.query);
      const baseHref = `${BASE_URL}/api/actions/mint-nft-collection?to=${toPubkey.toBase58()}`;
  
      res.json({
        title: "Add Collection NFT",
        icon: "https://maroon-binding-lynx-58.mypinata.cloud/ipfs/QmSMSVFvm4gjsLXPihrFnM3CuzCBoeABZJVRWPq8wP9f8c",
        description: "Add Collection NFT trên ví Solana của bạn",
        links: {
          actions: [
            { 
              label: "Add Collection NFT", 
              href: baseHref,
              parameters: [
                {
                  name: "merkleTreePublicKey",
                  label: "Enter a merkleTreePublicKey",
                },
                {
                  name: "collectionNFT",
                  label: 'Enter a collectionNFT',
                },
                {
                  name: "accountArray",
                  label: "Enter a accountArray",
                }
              ], 
            },
          ],
        },
      });
    } catch (err) {
      handleError(res, err);
    }
}
  
export async function postMintNFTCollectionHandler(req: Request, res: Response): Promise<void> {
    try {
      console.log("Entered postMintNFTCollectionHandler");
      console.log(req.body);
      const { account, data } = req.body;
      console.log("account:", account);
      const collectionNFT = data.collectionNFT;
      const accountArray = data.accountArray;
      console.log("collectionNFT:", collectionNFT);
      console.log("accountArray:", accountArray);
      if (!account) throw new Error('Invalid "account" provided');
      if (!collectionNFT) throw new Error('Invalid "collectionNFT" provided');
      if (!accountArray) throw new Error('Invalid "accountArray" provided');
  
      const userPubkey = new PublicKey(account);
      const collectionMintPubkey = new PublicKey(collectionNFT);
      const treePubkey = new PublicKey(data.merkleTreePublicKey);
      console.log("userPubkey:", userPubkey);
      console.log("collectionMintPubkey:", collectionMintPubkey);
      console.log("treePubkey:", treePubkey);
  
      const recipientPubkeys = accountArray
        .split(',')
        .map((account: string) => account.trim())
        .filter((account: string) => account !== '')
        .map((account: string) => new PublicKey(account));
  
      console.log("recipientPubkeys:", recipientPubkeys);
  
      const { transactionObject, walletKeypair } = await mintNFTCollectionHandler(userPubkey, connection, collectionMintPubkey, recipientPubkeys, treePubkey);

      console.log("transactionObject:", transactionObject);
  
      const payload = await createResponsePayload(transactionObject, walletKeypair);
  
      res.json(payload);
    } catch (err) {
      handleError(res, err, 400);
    }
}
