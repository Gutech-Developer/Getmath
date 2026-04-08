import type { ISidebarMenu } from "@/constant/roleBasedSidebarMenu";
import { isActiveMenu } from "@/libs/utils";
import Link from "next/link";
import ChevronLeftIcon from "../../atoms/icons/ChevronLeftIcon";
import LogoutIcon from "../../atoms/icons/LogoutIcon";

interface IDefaultSidebarContentProps {
  pathname: string;
  userName: string;
  roleLabel: string;
  sidebarMenu: ISidebarMenu[];
  openMenus: string[];
  onToggleMenu: (menuName: string) => void;
  onNavigate: () => void;
  onLogout: () => void;
}

export default function DefaultSidebarContent({
  pathname,
  userName,
  roleLabel,
  sidebarMenu,
  openMenus,
  onToggleMenu,
  onNavigate,
  onLogout,
}: IDefaultSidebarContentProps) {
  return (
    <div className="w-full h-full flex flex-col gap-4 lg:gap-5">
      <Link
        href="/profile"
        onClick={onNavigate}
        className={`px-4 lg:px-5 cursor-pointer duration-200 ${
          isActiveMenu("/profile", pathname)
            ? "bg-charcoal-green-lighter text-neutral-01"
            : "hover:bg-moss-stone/10 text-neutral-02"
        }`}
      >
        <div className="w-full flex items-center gap-3 lg:gap-4 py-4 lg:py-5 border-b border-grey-stroke">
          <div className="w-10 h-10 lg:w-[3.2rem] lg:h-[3.2rem] bg-moss-stone/20 rounded-sm flex items-center justify-center shrink-0">
            <span className="text-charcoal-green-dark font-medium text-base lg:text-lg">
              {userName.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex flex-col gap-1 lg:gap-2 min-w-0">
            <p className="font-medium text-sm truncate line-clamp-1">
              {userName}
            </p>
            <p
              className={`${
                isActiveMenu("/profile", pathname)
                  ? "text-grey-light"
                  : "text-grey"
              } font-normal text-xs capitalize`}
            >
              {roleLabel}
            </p>
          </div>
          <ChevronLeftIcon className="w-4 h-4 rotate-180 ml-auto" />
        </div>
      </Link>

      <div className="flex flex-col gap-5 w-full flex-1 overflow-hidden">
        <p className="text-moss-stone font-medium text-xs shrink-0 px-5">
          MENU
        </p>
        <div className="flex-1 overflow-y-auto thinnest-scrollbar px-5">
          <ul className="flex flex-col gap-2">
            {sidebarMenu.map((item) => {
              const isActive = isActiveMenu(item.url, pathname);
              const isMenuOpen = openMenus.includes(item.name);
              const hasSubMenu = item.subMenu.length > 0;
              const IconComponent = item.icon;

              return (
                <li key={item.name} className="text-xs w-full">
                  {hasSubMenu ? (
                    <button
                      className={`flex items-center w-full gap-3 py-2.5 p-3 rounded-lg ${
                        !isActive && "hover:bg-moss-stone/10"
                      } duration-200`}
                      onClick={() => onToggleMenu(item.name)}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span>{item.name}</span>
                      <ChevronLeftIcon
                        className={`ml-auto transition-transform duration-200 text-neutal-02 ${
                          isMenuOpen ? "rotate-90" : "-rotate-90"
                        }`}
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.url}
                      onClick={onNavigate}
                      className={`flex items-center w-full gap-3 py-2.5 p-3 rounded-lg ${
                        !isActive && "hover:bg-moss-stone/10"
                      } duration-200 ${
                        isActive
                          ? "text-neutral-01 bg-charcoal-green-lighter font-medium"
                          : "text-neutral-02"
                      }`}
                    >
                      <IconComponent
                        className={`w-5 h-5 ${
                          isActive ? "text-neutral-01" : "text-neutral-02"
                        }`}
                      />
                      <span>{item.name}</span>
                    </Link>
                  )}

                  <div
                    className={`overflow-hidden transition-all duration-400 ease-in-out ${
                      hasSubMenu && isMenuOpen
                        ? "max-h-[500px] opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    {hasSubMenu && (
                      <ul className="mt-2 ml-4 pl-4 border-l border-grey-stroke">
                        {item.subMenu.map((sub) => {
                          const isSubActive = isActiveMenu(sub.url, pathname);

                          return (
                            <li key={sub.name}>
                              <Link
                                href={sub.url}
                                onClick={onNavigate}
                                className={`block py-2.5 p-3 rounded-lg ${
                                  !isSubActive && "hover:bg-moss-stone/10"
                                } duration-200 ${
                                  isSubActive
                                    ? "text-neutral-01 font-medium bg-charcoal-green-lighter"
                                    : "text-grey"
                                }`}
                              >
                                {sub.name}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="w-full px-5">
        <div className="w-full h-px bg-grey-stroke"></div>
      </div>

      <div className="flex flex-col gap-5 pb-5">
        <p className="text-moss-stone font-medium text-xs shrink-0 px-5">
          LAINNYA
        </p>
        <div className="px-5 flex flex-col gap-1.5">
          <button
            onClick={onLogout}
            className="flex w-full gap-3 py-2.5 p-3 rounded-lg hover:bg-error/10 duration-200 text-xs items-center text-error"
          >
            <LogoutIcon className="w-5 h-5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
