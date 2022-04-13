import * as anchor from '@project-serum/anchor';

import { MintCountdown } from './MintCountdown';
import { toDate, formatNumber } from '../utils/utils';
import { CandyMachineAccount } from '../utils/candy-machine';
import { useEffect, useState } from 'react';

export const Header = ({
    candyMachine,
    refreshCandyMachineState,
}: {
    candyMachine?: CandyMachineAccount;
    refreshCandyMachineState: any;
}) => {
    const [itemsRemaining, setItemsRemaining] = useState<number>();
    useEffect(() => {
        // amount to stop the mint?
        if (candyMachine?.state.endSettings?.endSettingType.amount) {
            let limit = Math.min(candyMachine.state.endSettings.number.toNumber(), candyMachine.state.itemsAvailable);
            if (candyMachine.state.itemsRedeemed < limit) {
                setItemsRemaining(limit - candyMachine.state.itemsRedeemed);
            } else {
                setItemsRemaining(0);
                candyMachine.state.isSoldOut = true;
            }
        } else {
            setItemsRemaining(candyMachine?.state.itemsRemaining);
        }
    }, []);
    return (
        <div className="flex flex-row flex-nowrap end">
            {candyMachine && (
                <>
                    <div className="flex flex-col justify-center text-center align-middle flex-nowrap basis-1/4">
                        <p className="m-0 text-sm font-normal tracking-wide text-neutral-300">Remaining</p>
                        <p className="m-0 text-xl font-semibold tracking-wide text-white">{`${itemsRemaining}`}</p>
                    </div>{' '}
                    <div className="flex flex-col justify-center text-center align-middle flex-nowrap basis-1/4">
                        <p className="m-0 text-sm font-normal tracking-wide text-neutral-300">Price</p>
                        <p className="m-0 text-xl font-semibold tracking-wide text-white">
                            {getMintPrice(candyMachine)}
                        </p>
                    </div>
                </>
            )}
            <MintCountdown
                date={toDate(
                    candyMachine?.state.goLiveDate
                        ? candyMachine?.state.goLiveDate
                        : candyMachine?.state.isPresale
                        ? new anchor.BN(new Date().getTime() / 1000)
                        : undefined
                )}
                status={
                    !candyMachine?.state?.isActive || candyMachine?.state?.isSoldOut
                        ? 'COMPLETED'
                        : candyMachine?.state.isPresale
                        ? 'PRESALE'
                        : 'LIVE'
                }
                refreshCandyMachineState={refreshCandyMachineState}
            />
        </div>
    );
};

const getMintPrice = (candyMachine: CandyMachineAccount): string => {
    const price = formatNumber.asNumber(
        candyMachine.state.isPresale && candyMachine.state.whitelistMintSettings?.discountPrice
            ? candyMachine.state.whitelistMintSettings?.discountPrice!
            : candyMachine.state.price!
    );
    return `◎ ${price}`;
};
