import { useWallet } from "@beratrax/core/hooks";
import { NotSignedIn } from "../NotSignedIn/NotSignedIn";

export const SignInRequiredWrapper = ({ children }: { children: JSX.Element }) => {
  const { currentWallet } = useWallet();
  return currentWallet ? children : <NotSignedIn />;
};
