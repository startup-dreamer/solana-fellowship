import { Keypair, PublicKey, Transaction, Connection } from "@solana/web3.js";
import { toWeb3JsInstruction } from "@metaplex-foundation/umi-web3js-adapters";
import { createNft } from '@metaplex-foundation/mpl-token-metadata';
import { generateSigner, Umi, percentAmount } from '@metaplex-foundation/umi';
import { MetadataArgsArgs, mintToCollectionV1 } from "@metaplex-foundation/mpl-bubblegum";
import bs58 from "bs58";
import { publicKey } from '@metaplex-foundation/umi';
import { createUmiInstance } from "./utils";

import dotenv from 'dotenv';
import { Request, Response } from "express";
import { createResponsePayload, handleError, validatedQueryParams } from './utils';
import { BASE_URL, connection } from './utils';

dotenv.config();

export async function getMintNFTHandler(req: Request, res: Response): Promise<void> {
    try {
      const { toPubkey } = validatedQueryParams(req.query);
      const baseHref = `${BASE_URL}/api/actions/mint-nft?to=${toPubkey.toBase58()}`;
  
      res.json({
        title: "Actions Example - Transfer Native SOL",
        icon: "https://maroon-binding-lynx-58.mypinata.cloud/ipfs/QmSMSVFvm4gjsLXPihrFnM3CuzCBoeABZJVRWPq8wP9f8c",
        description: "Transfer SOL to another Solana wallet",
        links: {
          actions: [
            { 
              label: "Mint NFT",
              href: baseHref,
              parameters: [
                {
                  name: "merkleTreePublicKey",
                  label: "Enter a merkleTreePublicKey",
                }
              ]
            },
          ],

        },
      });
    } catch (err) {
      handleError(res, err);
    }
}
  
export async function postMintNFTHandler(req: Request, res: Response): Promise<void> {
    try {
      const { account, data } = req.body;
      if (!account) throw new Error('Invalid "account" provided');
  
      const userPublicKey = new PublicKey(account);
      console.log(userPublicKey);

      const treePublicKey = new PublicKey(data.merkleTreePublicKey);
      console.log(treePublicKey);

      const { transactionObject, walletKeypair } = await mintNFTHandler(userPublicKey, connection, treePublicKey);

      const payload = await createResponsePayload(transactionObject as unknown as Transaction, walletKeypair);
  
      res.json(payload);
    } catch (err) {
      handleError(res, err, 400);
    }
}

export async function createNftBuilderHandler(umiInstance: Umi, recipientPubkey: PublicKey, treePubkey: PublicKey, collectionMintPubkey: PublicKey) {
  
  return mintToCollectionV1(umiInstance, {
    leafOwner: publicKey(recipientPubkey),
    merkleTree: publicKey(treePubkey),
    collectionMint: publicKey(collectionMintPubkey),
    metadata: {
      name: "Sumit Kumar Collection",
      uri: "https://maroon-binding-lynx-58.mypinata.cloud/ipfs/QmUbVWjou4FwFDjfr4vW2DGWmWCizmbgtZ9JzvF2nL7s1Z",
      sellerFeeBasisPoints: 500,
      collection: {
        key: publicKey(collectionMintPubkey),
        verified: false,
      },
      creators: [
        {address: publicKey(recipientPubkey), verified: false, share: 100}
      ],
    } as MetadataArgsArgs,
  });
}

export async function mintNFTHandler(userPubkey: PublicKey, networkConnection: Connection, treePubkey: PublicKey) {
  const walletKeypair = Keypair.fromSecretKey(
    bs58.decode(
      process.env.SOLANA_PRIVATE_KEY || ""
    )
  );
  console.log("walletKeypair", walletKeypair.publicKey);
  const umiInstance = createUmiInstance(walletKeypair);

  const collectionMintSigner = generateSigner(umiInstance);
  console.log("collectionMintSigner", collectionMintSigner);
  await createNft(umiInstance, {
    mint: collectionMintSigner,
    name: "Sumit Kumar Collection",
    uri: "https://maroon-binding-lynx-58.mypinata.cloud/ipfs/QmUbVWjou4FwFDjfr4vW2DGWmWCizmbgtZ9JzvF2nL7s1Z",
    sellerFeeBasisPoints: percentAmount(5.5), // 5.5%
    isCollection: true,
  }).sendAndConfirm(umiInstance);

  console.log("userPubkey", userPubkey);
  const recipientPubkey = new PublicKey(userPubkey);
  const treePublicKey = new PublicKey(treePubkey);
  const collectionMintPublicKey = new PublicKey(collectionMintSigner.publicKey);
  const builder = await createNftBuilderHandler(umiInstance, recipientPubkey, treePublicKey, collectionMintPublicKey);

  const instructions = await builder.getInstructions().map(toWeb3JsInstruction);

  const transactionObject = new Transaction().add(...instructions);

  transactionObject.feePayer = userPubkey;
  transactionObject.recentBlockhash = (await networkConnection.getLatestBlockhash()).blockhash;

  return { transactionObject, walletKeypair };
}