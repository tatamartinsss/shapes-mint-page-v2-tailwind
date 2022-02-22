import styled from 'styled-components';

import { CandyMachineAccount } from '../utils/candy-machine';

import { GatewayStatus, useGateway } from '@civic/solana-gateway-react';
import { useEffect, useState } from 'react';

export const CTAButton = styled.button`
  
  margin-top: 10px;
  margin-bottom: 5px;
  background: linear-gradient(29deg, #34342F 0%,  #44C3A1 100%);
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
  userHasWhitelistToken
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
      return     <div className="flex items-center justify-center">
      <div
          className="inline-block w-8 h-8 font-bold text-white text-gray-300 bg-current rounded-full opacity-0 spinner-grow"
          role="status"
      ></div>
  </div>;
    } else if  (!userHasWhitelistToken && candyMachine?.state.isPresale ) {return "NO WL TOKENS"}
    else if (candyMachine?.state.isPresale) {
      return 'PRESALE MINT';
    }

    return 'MINT';
  };

  return (
    <button className="w-full mt-2 mb-1 font-bold text-white rounded-md drop-shadow-lg bg-gradient-to-r from-cyan-500 to-blue-500 h-14 disabled:opacity-25"
      disabled={
        candyMachine?.state.isSoldOut ||
        isMinting ||
        !candyMachine?.state.isActive || (!userHasWhitelistToken&& candyMachine?.state.isPresale)
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
