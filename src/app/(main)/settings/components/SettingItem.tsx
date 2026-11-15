interface SettingItemProps {
    title: string;
    description: string;
    icon?: React.ElementType;
    action?: React.ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({ title, description, icon: Icon, action }) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-gray-300 gap-2">
            <div className="flex items-center space-x-3">
                {Icon && <Icon className="w-5 h-5 text-gray-700" />}
                <div>
                <h3 className="font-medium text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
                </div>
            </div>
            <div className="ml-8 md:ml-0">
                {action}
            </div>
        </div>
    );
};

export default SettingItem;