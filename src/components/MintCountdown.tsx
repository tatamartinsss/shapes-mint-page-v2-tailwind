
import Countdown from 'react-countdown';

interface MintCountdownProps {
    date: Date | undefined;
    style?: React.CSSProperties;
    status?: string;
    onComplete?: () => void;
    refreshCandyMachineState: any;
}

interface MintCountdownRender {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    completed: boolean;
}

export const MintCountdown: React.FC<MintCountdownProps> = ({
    date,
    status,
    style,
    onComplete,
    refreshCandyMachineState,
}) => {
    //const classes = useStyles();
    const renderCountdown = ({ days, hours, minutes, seconds, completed }: MintCountdownRender) => {
        hours += days * 24;
        if (completed) {
            return status ? (
                <div className="flex flex-col justify-center text-center align-middle flex-nowrap basis-1/2">
                <div className="flex flex-col justify-center px-2 py-2 my-2 text-lg font-bold text-center text-white align-middle rounded bg-stone-600">
                    {status}
                </div></div>
            ) : null;
        } else {
            return (
                <div className="flex flex-row flex-nowrap basis-1/2">
                    <div className="justify-center m-1 mr-0 text-center text-white align-middle rounded basis-1/3 font-xl bg-slate-800">
                        <div className="text-lg font-bold">{hours < 10 ? `0${hours}` : hours}</div>
                        <span>hrs</span>
                    </div>
                    <div className="flex-col justify-center m-1 mr-0 text-center text-white align-middle rounded basis-1/3 flex-0 font-xl bg-slate-800">
                        <div className="text-lg font-bold ">{minutes < 10 ? `0${minutes}` : minutes}</div>
                        <span>mins</span>
                    </div>
                    <div className="flex-col justify-center m-1 mr-0 text-center text-white align-middle rounded basis-1/3 flex-0 font-xl bg-slate-800">
                        <div className="text-lg font-bold ">{seconds < 10 ? `0${seconds}` : seconds}</div>
                        <span>secs</span>
                    </div>
                </div>
            );
        }
    };

    if (date) {
        return <Countdown date={date} onComplete={() => refreshCandyMachineState()} renderer={renderCountdown} />;
    } else {
        return null;
    }
};
