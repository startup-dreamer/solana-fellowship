'use client';
import s from "./ui.module.css";
import Image from "next/image";
import app_hero_img from "./images/layer.png";

import { WalletButton } from './provider';
import * as React from 'react';
import { ReactNode, Suspense, useEffect, useRef } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AccountChecker } from './accounts';
import {
  ClusterChecker,
  ClusterUiSelect,
  ExplorerLink,
} from './cluster';

import toast, { Toaster } from 'react-hot-toast';



export function UiLayout({
  children,
  links,
}: {
  children: ReactNode;
  links: { label: string; path: string }[];
}) {
  const pathname = usePathname();

  return (
    <div className="h-full flex flex-col">
      <div className={s["navbar_main_parent"]}>
        <div className={s["navbar_main"]}>
          <div className="flex-1">
            <Link className="btn btn-ghost normal-case text-xl" href="/">
              {/* <img className="h-4 md:h-6" alt="Logo" src="/logo.png" /> */}
              Market
            </Link>
            <ul className="menu menu-horizontal px-1 space-x-2">
              {links.map(({ label, path }) => (
                <li key={path}>
                  <Link
                    className={pathname.startsWith(path) ? 'active' : ''}
                    href={path}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className={s["navbar_button_holder"]}>
            <WalletButton />
            <ClusterUiSelect />
          </div>
        </div>

        <ClusterChecker>
          <AccountChecker />
        </ClusterChecker>
      </div>
      <div className="flex-grow mx-4 lg:mx-auto">
        <Suspense
          fallback={
            <div className="text-center my-32">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          }
        >
          {children}
        </Suspense>
        <Toaster position="bottom-right" />
      </div>
      {/* <footer className="footer footer-center p-4 bg-base-300 text-base-content">
          <aside>
            <p>
              Create for Solana Summer Fellowship --{' '}
              <a
                className="link hover:text-white"
                href="https://github.com/arjanjohan/solana-summer-fellowship/tree/main/s2-token-program"
                target="_blank"
                rel="noopener noreferrer"
              >
                Github repo
              </a>
            </p>
          </aside>
        </footer> */}
    </div>
  );
}

export function AppModal({
  children,
  title,
  hide,
  show,
  submit,
  submitDisabled,
  submitLabel,
}: {
  children: ReactNode;
  title: string;
  hide: () => void;
  show: boolean;
  submit?: () => void;
  submitDisabled?: boolean;
  submitLabel?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (!dialogRef.current) return;
    if (show) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [show, dialogRef]);

  return (
    <dialog className="modal" ref={dialogRef}>
      <div className="modal-box space-y-5">
        <h3 className="font-bold text-lg">{title}</h3>
        {children}
        <div className="modal-action">
          <div className="join space-x-2">
            {submit ? (
              <button
                className="btn btn-xs lg:btn-md btn-primary"
                onClick={submit}
                disabled={submitDisabled}
              >
                {submitLabel || 'Save'}
              </button>
            ) : null}
            <button onClick={hide} className="btn">
              Close
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export function AppHero({
  children,
  title,
  subtitle,
}: {
  children?: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
}) {
  return (
    <div className={s["hero_main_holder"]}>
      <div className={s["hero_main"]}>
        <div className={s["top_text_main"]}>
          {typeof title === 'string' ? (
            <h1>{title}</h1>
          ) : (
            title
          )}
          {typeof subtitle === 'string' ? (
            <p>{subtitle}</p>
          ) : (
            subtitle
          )}
          {children}
        </div>
        <div>
          <Image src={app_hero_img} alt="app_hero_img" width={250} height={250} />
        </div>
      </div>
    </div>
  );
}

export function ellipsify(str = '', len = 4) {
  if (str.length > 30) {
    return (
      str.substring(0, len) + '..' + str.substring(str.length - len, str.length)
    );
  }
  return str;
}

export function useTransactionToast() {
  return (signature: string) => {
    toast.success(
      <div className={'text-center'}>
        <div className="text-lg">Transaction sent</div>
        <ExplorerLink
          path={`tx/${signature}`}
          label={'View Transaction'}
          className="btn btn-xs btn-primary"
        />
      </div>
    );
  };
}
