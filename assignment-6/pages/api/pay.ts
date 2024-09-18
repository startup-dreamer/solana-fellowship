import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { encodeURL, findReference, validateTransfer } from '@solana/pay';
import BigNumber from 'bignumber.js';

const myWallet = 'H3QFot1G5Xe8wAjkQbLLt5dEYsHBsicKLHL1aSBv2H2d';
const recipient = new PublicKey(myWallet);
const amount = new BigNumber(0.0001);
const label = 'Solana Shop';
const memo = 'Memo: Fellowship Assignment 6';
const quicknodeEndpoint = 'https://example.solana-devnet.quiknode.pro/123456/';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const reference = new Keypair().publicKey;
      const message = `Fellowship Assignment 6 - Order #0${Math.floor(Math.random() * 999999) + 1}`;
      const urlData = await generateUrl(
        recipient,
        amount,
        reference,
        label,
        message,
        memo
      );
      const ref = reference.toBase58();
      paymentRequests.set(ref, { recipient, amount, memo });
      const { url } = urlData;
      res.status(200).json({ url: url.toString(), ref });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else if (req.method === 'GET') {
    const reference = req.query.reference;
    if (!reference) {
      res.status(400).json({ error: 'Missing reference query parameter' });
      return;
    }
    try {
      const referencePublicKey = new PublicKey(reference as string);
      const response = await verifyTransaction(referencePublicKey);
      if (response) {
        res.status(200).json({ status: 'verified' });
      } else {
        res.status(404).json({ status: 'not found' });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}

async function generateUrl(
  recipient: PublicKey,
  amount: BigNumber,
  reference: PublicKey,
  label: string,
  message: string,
  memo: string,
) {
  const url: URL = encodeURL({
    recipient,
    amount,
    reference,
    label,
    message,
    memo,
  });
  return { url };
}

const paymentRequests = new Map<string, { recipient: PublicKey; amount: BigNumber; memo: string }>();

async function verifyTransaction(reference: PublicKey) {
  const paymentData = paymentRequests.get(reference.toBase58());
  if (!paymentData) {
    throw new Error('Payment request not found');
  }
  const { recipient, amount, memo } = paymentData;
  const connection = new Connection(quicknodeEndpoint, 'confirmed');
  console.log('recipient', recipient.toBase58());
  console.log('amount', amount);
  console.log('reference', reference.toBase58());
  console.log('memo', memo);

  const found = await findReference(connection, reference);
  console.log(found.signature)

  const response = await validateTransfer(
    connection,
    found.signature,
    {
      recipient,
      amount,
      splToken: undefined,
      reference,
    },
    { commitment: 'confirmed' }
  );
  if (response) {
    paymentRequests.delete(reference.toBase58());
  }
  return response;
}