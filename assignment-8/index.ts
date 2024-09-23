import dotenv from 'dotenv';
import express from "express";
import { actionCorsMiddleware } from "@solana/actions";
import { getMintNFTHandler, postMintNFTHandler } from './cNFT';
import { getMintNFTCollectionHandler, postMintNFTCollectionHandler } from './cNFTCollection';
import { fetchCreateMerkleTree, submitCreateMerkleTree } from './Merkle-Tree';
import { PORT} from './utils';

dotenv.config();

const app = express();
app.use(express.json());
app.use(actionCorsMiddleware({}));

app.get("/api/actions/get-merkle-tree", fetchCreateMerkleTree);
app.post("/api/actions/post-merkle-tree", submitCreateMerkleTree);

app.get("/api/actions/get-nft", getMintNFTHandler);
app.post("/api/actions/post-nft", postMintNFTHandler);

app.get("/api/actions/get-nft-collection", getMintNFTCollectionHandler);
app.post("/api/actions/post-nft-collection", postMintNFTCollectionHandler);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

export default app;

