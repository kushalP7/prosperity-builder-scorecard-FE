import React from 'react';
import {
  Link as RouterLink,
  NavLink as RouterNavLink,
  useNavigate,
  useLocation,
  useParams as useRouterParams,
  useSearchParams as useRouterSearchParams,
  Navigate,
} from 'react-router-dom';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
  to?: string;
  replace?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, to, children, className, ...rest }, ref) => {
    const targetPath = to || href || '';
    const isExternal =
      targetPath.startsWith('http://') ||
      targetPath.startsWith('https://') ||
      targetPath.startsWith('mailto:') ||
      targetPath.startsWith('tel:');

    if (isExternal) {
      return (
        <a ref={ref} href={targetPath} className={className} {...rest}>
          {children}
        </a>
      );
    }

    return (
      <RouterLink ref={ref} to={targetPath} className={className} {...rest}>
        {children}
      </RouterLink>
    );
  }
);
Link.displayName = 'Link';

export function useRouter() {
  const navigate = useNavigate();
  const location = useLocation();

  return React.useMemo(
    () => ({
      push: (url: string) => navigate(url),
      replace: (url: string) => navigate(url, { replace: true }),
      back: () => navigate(-1),
      forward: () => navigate(1),
      refresh: () => window.location.reload(),
      prefetch: () => {},
      pathname: location.pathname,
    }),
    [navigate, location.pathname]
  );
}

export function usePathname(): string {
  const location = useLocation();
  return location.pathname;
}

export function useParams<T extends Record<string, string | string[] | undefined> = Record<string, string | undefined>>(): T {
  const params = useRouterParams();
  return params as unknown as T;
}

export function useSearchParams(): URLSearchParams {
  const [searchParams] = useRouterSearchParams();
  return searchParams;
}

export function redirect(url: string) {
  if (typeof window !== 'undefined') {
    window.location.href = url;
  }
}

export { RouterLink, RouterNavLink as NavLink, useNavigate, useLocation, Navigate };
export default Link;
