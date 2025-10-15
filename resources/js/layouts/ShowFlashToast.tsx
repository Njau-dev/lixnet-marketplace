import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';

export default function ShowFlashToast() {
    const { flash } = usePage().props as any;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
        if (flash?.info) toast(flash.info);
    }, [flash]);

    return null;
}
