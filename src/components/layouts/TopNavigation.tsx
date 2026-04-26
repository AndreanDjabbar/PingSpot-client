import { BiMenu } from "react-icons/bi";
import PingspotLogo from "../UI/PingspotLogo";

interface TopNavigationProps {
    onMenuToggle: () => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ onMenuToggle }) => {
    return (
        <div className="xl:hidden bg-pingspot">
            <div className="flex items-center justify-between px-4 py-3">
                <button
                onClick={onMenuToggle}
                className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer"
                >
                    <BiMenu className="w-6 h-6 text-muted" />
                </button>
                
                <PingspotLogo size="150"/>
            </div>
        </div>
    )
}

export default TopNavigation;