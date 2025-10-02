import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden">
                <img
                    src="/logo-icon.png"
                    alt="Lixnet Logo"
                    className="h-full w-full object-cover object-top"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">Lixnet Marketplace</span><span className="text-muted-foreground text-xs">Admin Dashboard</span>
            </div>
        </>
    );
}
