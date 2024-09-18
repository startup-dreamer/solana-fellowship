import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { createQR } from '@solana/pay';
import s from "./index.module.css";

interface Item {
  id: number;
  name: string;
  price: string;
  image: string;
}

interface Items {
  [key: string]: Item[];
}

const items: Items = {
  "tshirts": [
    { id: 1, name: 'Solana white', price: '0.1', image: '/assets/tshirts/tshirt1.jpeg' },
    { id: 2, name: "Solana black", price: '0.3', image: '/assets/tshirts/tshirt2.jpeg' },
    { id: 3, name: 'Solana icon white', price: '0.2', image: '/assets/tshirts/tshirt3.jpeg' },
    { id: 4, name: 'Solana icon black', price: '0.1', image: '/assets/tshirts/tshirt4.jpeg' },
  ],
  "hoodies": [
    { id: 1, name: "Solana white", price: '0.1', image: '/assets/hoodies/hoodie1.jpeg' },
    { id: 2, name: "Solana black", price: '0.3', image: '/assets/hoodies/hoodie2.jpeg' },
  ],
  "mugs": [
    { id: 1, name: "Dollar Paper Mug", price: '0.1', image: '/assets/mugs/mug1.jpeg' },
  ],
  "sticker": [
    { id: 1, name: "Solana Sticker (Full)", price: '0.3', image: '/assets/stickers/sticker1.jpeg' },
    { id: 2, name: "Solana Sticker", price: '0.1', image: '/assets/stickers/sticker2.jpeg' },
  ],
  "pillows": [
    { id: 1, name: "Solana Pillow", price: '0.3', image: '/assets/pillows/pillow1.jpeg' },
  ],
};

export default function Home() {
  const [qrCode, setQrCode] = useState<string>();
  const [reference, setReference] = useState<string>();

  const [itemsType, setItemsType] = useState("tshirts");
  const [qr_display, setQRDisplay] = useState(false);

  const handleBuyClick = async (price: string) => {
    const res = await fetch('/api/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: price }),
    });
    const { url, ref } = await res.json();
    console.log(url);
    const qr = createQR(url);
    const qrBlob = await qr.getRawData('png');
    if (!qrBlob) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setQrCode(event.target.result);
        setQRDisplay(true);
      }
    };
    reader.readAsDataURL(qrBlob);
    setReference(ref);
  };

  const handleVerifyClick = async () => {
    const res = await fetch(`/api/pay?reference=${reference}`);
    const { status } = await res.json();
    if (status === 'verified') {
      alert('Transaction verified');
      setQrCode(undefined);
      setReference(undefined);
    } else {
      alert('Transaction not found');
    }
  };

  return (
    <>
      <Head>
        <title>Solana Market</title>
        <meta name="description" content="Solana Fellowship: Solana Pay" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-between">
        <div className={s["navbar_main"]}>
          <h1>Solana Market</h1>
          <ul>
            <li className={s[itemsType == "tshirts" ? "active" : ""]} id="tshirts" onClick={(e: React.MouseEvent<HTMLLIElement>) => setItemsType(e.currentTarget.id)}>T-Shirts</li>
            <li className={s[itemsType == "hoodies" ? "active" : ""]} id="hoodies" onClick={(e: React.MouseEvent<HTMLLIElement>) => setItemsType(e.currentTarget.id)}>Hoodies</li>
            <li className={s[itemsType == "mugs" ? "active" : ""]} id="mugs" onClick={(e: React.MouseEvent<HTMLLIElement>) => setItemsType(e.currentTarget.id)}>Mugs</li>
            <li className={s[itemsType == "sticker" ? "active" : ""]} id="sticker" onClick={(e: React.MouseEvent<HTMLLIElement>) => setItemsType(e.currentTarget.id)}>Stickers</li>
            <li className={s[itemsType == "pillows" ? "active" : ""]} id="pillows" onClick={(e: React.MouseEvent<HTMLLIElement>) => setItemsType(e.currentTarget.id)}>Pillows</li>
          </ul>
        </div>
        <div className={s["grid_items"]}>
          {Array.isArray(items[itemsType]) && items[itemsType].map((item) => (
            <div key={item.id} className={s["grid_items_child"]}>
              <Image
                src={item.image}
                alt={item.name}
                width={250}
                height={200}
                priority
              />
              <div className={s["grid_items_details"]}>
                <div>
                  <h2>{item.name}</h2>
                  <p>{item.price} SOL</p>
                </div>
                <button
                  onClick={() => handleBuyClick(item.price)}
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className={s["qr_holder_main"]} style={qr_display ? {"display":"flex"} : {"display":"none"}}>
          <div className={s["qr_holder"]}>
            <div className={s["qr_holder_cross"]} onClick={()=> setQRDisplay(false)}>
              x
            </div>
            Scan the QR code to pay
            {qrCode && (
              <div className={s["qr_box"]}>
                <Image
                  src={qrCode}
                  style={{ position: "relative", background: "white" }}
                  alt="QR Code"
                  width={200}
                  height={200}
                  priority
                />
              </div>
            )}
            <div className={s["verify_button"]}>
              {reference && (
                <button
                  
                  onClick={handleVerifyClick}
                >
                  Verify Transaction
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}