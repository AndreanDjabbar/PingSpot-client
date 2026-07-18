import { AuthLayout } from "@/components";
import { Scrollbar } from "@/components";

const AuthLayoutWrapper = ({children}: {children: React.ReactNode}) => {
    return (
        <Scrollbar>
            <AuthLayout>
                {children}
            </AuthLayout>
        </Scrollbar>
    )
}

export default AuthLayoutWrapper;