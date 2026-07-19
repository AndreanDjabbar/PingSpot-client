import { BiMenu } from "react-icons/bi";
import PingspotLogo from "../UI/PingspotLogo";

interface TopNavigationProps {
    onMenuToggle: () => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ onMenuToggle }) => {
    return (
        <div className="xl:hidden bg-pingspot fixed top-0 left-0 right-0 z-40 w-full border-b border-gray-200 bg-background">
            <div className="flex items-center justify-between px-4 py-3">
                <button
                onClick={onMenuToggle}
                className="p-2 rounded-lg hover:bg-white/10 hover:text-white/90 transition-colors cursor-pointer"
                >
                    <BiMenu className="w-6 h-6 text-white" />
                </button>
                <div className="w-17">
                    <PingspotLogo size="60" className="p-1" variant="full" color="white"/>
                </div>
            </div>
        </div>
    )
}

export default TopNavigation;