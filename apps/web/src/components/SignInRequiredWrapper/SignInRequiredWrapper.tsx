import { useWallet } from "@beratrax/core/src/hooks";
import { NotSignedIn } from "web/src/components/NotSignedIn/NotSignedIn";

export const SignInRequiredWrapper = ({ children }: { children: JSX.Element }) => {
  const { currentWallet } = useWallet();
  return currentWallet ? children : <NotSignedIn />;
};
