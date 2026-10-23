import { Loading } from "@/components/feedback/Loading";
import VerificationClient from "./VerificationClient";
import { Suspense } from "react";

const VerificationPage = () => {
    return (
        <Suspense fallback={<Loading size='xl' className='fixed inset-0 left-0 xl:left-60'/>}>
            <VerificationClient />
        </Suspense>
    );
}

export default VerificationPage;