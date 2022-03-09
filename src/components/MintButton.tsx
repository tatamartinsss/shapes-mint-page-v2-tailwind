import styled from 'styled-components';

import { CandyMachineAccount } from '../utils/candy-machine';

import { GatewayStatus, useGateway } from '@civic/solana-gateway-react';
import { useEffect, useState } from 'react';

export const CTAButton = styled.button`
    margin-top: 10px;
    margin-bottom: 5px;
    background: linear-gradient(29deg, #34342f 0%, #44c3a1 100%);
    color: white;
    font-size: 16px;
    font-weight: bold;
    box-shadow: 0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%);
    background-color: #e0e0e0;
    border: 0px;
    transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    transition-property: box-shadow;
    transition-duration: 300ms;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-delay: 0ms;
    background-color: #424242;
`; // add your own styles here

export const MintButton = ({
    onMint,
    candyMachine,
    isMinting,
    userHasWhitelistToken,
}: {
    onMint: () => Promise<void>;
    candyMachine?: CandyMachineAccount;
    isMinting: boolean;
    userHasWhitelistToken: boolean;
}) => {
    const { requestGatewayToken, gatewayStatus } = useGateway();
    const [clicked, setClicked] = useState(false);

    useEffect(() => {
        if (gatewayStatus === GatewayStatus.ACTIVE && clicked) {
            onMint();
            setClicked(false);
        }
    }, [gatewayStatus, clicked, setClicked, onMint]);

    const getMintButtonContent = () => {
        if (candyMachine?.state.isSoldOut) {
            return 'SOLD OUT';
        } else if (isMinting) {
            return (
                <div className="flex items-center justify-center">
                    {' '}
                    <svg
                        role="status"
                        className="z-50 w-10 h-10 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"
                        />
                        <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill"
                        />
                    </svg>
                </div>
            );
        } else if (!userHasWhitelistToken && candyMachine?.state.isPresale) {
            return 'NO WL TOKENS';
        } else if (candyMachine?.state.isPresale) {
            return 'PRESALE MINT';
        }

        return 'MINT';
    };

    return (
        <button
            className="w-full mt-2 mb-1 font-bold text-white rounded-md drop-shadow-lg bg-gradient-to-r from-cyan-500 to-blue-500 h-14 disabled:opacity-25"
            disabled={
                candyMachine?.state.isSoldOut ||
                isMinting ||
                !candyMachine?.state.isActive ||
                (!userHasWhitelistToken && candyMachine?.state.isPresale)
            }
            onClick={async () => {
                setClicked(true);
                if (candyMachine?.state.isActive && candyMachine?.state.gatekeeper) {
                    if (gatewayStatus === GatewayStatus.ACTIVE) {
                        setClicked(true);
                    } else {
                        await requestGatewayToken();
                    }
                } else {
                    await onMint();
                    setClicked(false);
                }
            }}
        >
            {getMintButtonContent()}
        </button>
    );
};
