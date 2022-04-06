import React, { useEffect, useMemo, useState, useCallback } from 'react';
import * as anchor from '@project-serum/anchor';
import { RiTwitterFill } from 'react-icons/ri';
import { FaDiscord } from 'react-icons/fa';
import { RiInstagramLine } from 'react-icons/ri';
import { AiOutlineMedium } from 'react-icons/ai';

import styled from 'styled-components';

import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';

import {
    awaitTransactionSignatureConfirmation,
    CandyMachineAccount,
    CANDY_MACHINE_PROGRAM,
    getCandyMachineState,
    mintOneToken,
} from './utils/candy-machine';
import { checkWLToken } from './utils/checkWLToken';
import { Header } from './components/Header';
import { MintButton } from './components/MintButton';
import { GatewayProvider } from '@civic/solana-gateway-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { usePoller } from './hooks/usePoller';

import toast, { Toaster } from 'react-hot-toast';

const IMAGE_LINK = '/logoempty2.png';
// const LOGO_LINK = '/logowhite.png';

const ConnectButton = styled(WalletMultiButton)`
    width: 100%;
    height: 60px;
    margin-top: 10px;
    margin-bottom: 5px;
    background: linear-gradient(29deg, #34342f 0%, #44c3a1 100%);
    color: white;
    font-size: 16px;
    font-weight: bold;
`;

const MintContainer = styled.div``; // add your owns styles here

export interface HomeProps {
    candyMachineId?: anchor.web3.PublicKey;
    connection: anchor.web3.Connection;
    startDate: number;
    txTimeout: number;
    rpcHost: string;
}

const Home = (props: HomeProps) => {
    const [isUserMinting, setIsUserMinting] = useState(false);
    const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();
    const [userHasWhitelistToken, setUserHasWhitelistToken] = useState(false);
    const [loading, setLoading] = useState(true);
    const rpcUrl = props.rpcHost;
    const wallet = useWallet();

    const anchorWallet = useMemo(() => {
        if (!wallet || !wallet.publicKey || !wallet.signAllTransactions || !wallet.signTransaction) {
            return;
        }

        return {
            publicKey: wallet.publicKey,
            signAllTransactions: wallet.signAllTransactions,
            signTransaction: wallet.signTransaction,
            //@ts-ignore
        } as anchor.Wallet;
    }, [wallet]);

    const refreshCandyMachineState = useCallback(async () => {
        if (!anchorWallet) {
            return;
        }

        if (props.candyMachineId) {
            try {
                const cndy = await getCandyMachineState(anchorWallet, props.candyMachineId, props.connection);
                setCandyMachine(cndy);
                const WLToken = await checkWLToken(
                    props.connection,
                    anchorWallet.publicKey,
                    cndy?.state?.whitelistMintSettings?.mint
                );
                WLToken ? setUserHasWhitelistToken(true) : setUserHasWhitelistToken(false);
                setLoading(false);
            } catch (e) {
                console.log('There was a problem fetching Candy Machine state');
                console.log(e);
            }
        }
    }, [anchorWallet, props.candyMachineId, props.connection]);
    let pollTime;
    usePoller(
        () => {
            refreshCandyMachineState();
        },
        pollTime ? pollTime : 9999
    );
    const onMint = async () => {
        try {
            setIsUserMinting(true);
            document.getElementById('#identity')?.click();
            if (wallet.connected && candyMachine?.program && wallet.publicKey) {
                const mintTxId = (await mintOneToken(candyMachine, wallet.publicKey))[0];

                let status: any = { err: true };
                if (mintTxId) {
                    status = await awaitTransactionSignatureConfirmation(
                        mintTxId,
                        props.txTimeout,
                        props.connection,
                        true
                    );
                }

                if (status && !status.err) {
                    toast.success('Congratulations! Mint succeeded!');
                } else {
                    toast.error('Mint failed! Please try again!');
                }
            }
        } catch (error: any) {
            let message = error.msg || 'Minting failed! Please try again!';
            if (!error.msg) {
                if (!error.message) {
                    message = 'Transaction Timeout! Please try again.';
                } else if (error.message.indexOf('0x137')) {
                    message = `SOLD OUT!`;
                    console.log(error.message);
                } else if (error.message.indexOf('0x135')) {
                    message = `Insufficient funds to mint. Please fund your wallet.`;
                }
            } else {
                if (error.code === 311) {
                    message = `SOLD OUT!`;
                    window.location.reload();
                } else if (error.code === 312) {
                    message = `Minting period hasn't started yet.`;
                }
            }

            toast.error(message);
        } finally {
            setIsUserMinting(false);
        }
    };

    useEffect(() => {
        refreshCandyMachineState();
    }, [anchorWallet, props.candyMachineId, props.connection, refreshCandyMachineState]);

    return (
        <div className="bg-ded w-full bg-no-repeat bg-cover min-h-screen">
            <Toaster />
            <div className="flex-col sm:flex-row sm:h-20 text-white bg-[#09142F] justify-center pt-6 sm:pt-0 flex sm:justify-between items-center sticky top-0 z-10">
                <a href="https://www.zoosolana.com/" className="self-center">
                    <div className="text-lg hover:text-[#2FCD8A] font-bold text-left pl-5 tracking-widest flex">
                        <span>SOLANA ZOO</span>
                    </div>
                </a>
                <div className="flex flex-col sm:flex-row items-center">
                    <div className="flex mr-3 divide-x p-3 divide-opacity-20 divide-gray-100">
                        <a
                            href="https://twitter.com/SolanaZoo_NFT"
                            className="text-xl tracking-widest font-semibold px-5 py-2 hover:text-[#2FCD8A] self-center"
                        >
                            <RiTwitterFill size="1.5em" />
                        </a>
                        <a
                            href="https://discord.com/invite/gBphrYNF8B"
                            className="text-xl tracking-widest font-semibold px-5 py-2 hover:text-[#2FCD8A] self-center "
                        >
                            <FaDiscord size="1.5em" />
                        </a>
                        <a
                            href="https://www.instagram.com/solanazoo/"
                            className="text-xl tracking-widest font-semibold px-5 py-2 hover:text-[#2FCD8A] self-center "
                        >
                            <RiInstagramLine size="1.5em" />
                        </a>
                        <a
                            href="https://solanazoo.medium.com/"
                            className="text-xl tracking-widest font-semibold px-5 py-2 hover:text-[#2FCD8A] self-center "
                        >
                            <AiOutlineMedium size="1.5em" />
                        </a>
                    </div>
                    <div className="pb-3 sm:pb-0 flex px-5">
                        <WalletMultiButton>
                            {wallet?.publicKey
                                ? `${wallet.publicKey.toString().slice(0, 4)}...${wallet.publicKey
                                      .toString()
                                      .slice(-4)}`
                                : 'Connect'}
                        </WalletMultiButton>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 place-content-top">
                {/* <div className="relative p-4 bg-[#138404] shadow-xl border-neutral-600 mt-3 ring-1  max-w-sm mx-auto rounded-lg my-3">
                    <img src={LOGO_LINK} alt="" width="100%" style={{ borderRadius: '5px' }} />
                </div> */}
                <div className="relative p-2 bg-[#212529] shadow-xl border-neutral-600 aspect-square ring-1  max-w-sm mx-auto my-3 rounded-lg ">
                    <img src={IMAGE_LINK} alt="" width="100%" style={{ borderRadius: '5px' }} />
                </div>

                <div className="mx-auto w-full py-2 px-4  bg-[#212529] shadow-xl border-neutral-600 ring-1  max-w-sm  my-3 rounded-lg ">
                    {!wallet.connected ? (
                        <ConnectButton>Connect Wallet</ConnectButton>
                    ) : loading ? (
                        <div className="flex items-center justify-center">
                            <div
                                className="inline-block w-8 h-8 text-gray-300 bg-current rounded-full opacity-0 spinner-grow"
                                role="status"
                            ></div>
                        </div>
                    ) : (
                        <>
                            <Header candyMachine={candyMachine} refreshCandyMachineState={refreshCandyMachineState} />
                            <MintContainer>
                                {candyMachine?.state.isActive &&
                                candyMachine?.state.gatekeeper &&
                                wallet.publicKey &&
                                wallet.signTransaction ? (
                                    <GatewayProvider
                                        wallet={{
                                            publicKey: wallet.publicKey || new PublicKey(CANDY_MACHINE_PROGRAM),
                                            //@ts-ignore
                                            signTransaction: wallet.signTransaction,
                                        }}
                                        gatekeeperNetwork={candyMachine?.state?.gatekeeper?.gatekeeperNetwork}
                                        clusterUrl={rpcUrl}
                                        options={{ autoShowModal: false }}
                                    >
                                        <MintButton
                                            candyMachine={candyMachine}
                                            isMinting={isUserMinting}
                                            onMint={onMint}
                                            userHasWhitelistToken={userHasWhitelistToken}
                                        />
                                    </GatewayProvider>
                                ) : (
                                    <MintButton
                                        candyMachine={candyMachine}
                                        isMinting={isUserMinting}
                                        onMint={onMint}
                                        userHasWhitelistToken={userHasWhitelistToken}
                                    />
                                )}
                            </MintContainer>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
