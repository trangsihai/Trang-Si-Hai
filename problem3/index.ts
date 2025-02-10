/*tsx
  
Issues:

- Interfaces 'WalletBalance' and 'FormattedWalletBalance' were duplicated and missing `blockchain` field. Move and use 1 interface
- The 'getPriority' is just calculate by paramater and dont effect React. Move it other file and write common. It simple data so use object
- Missing case 0 in sortedBalances function. 
- The 'index' should not be the key of WalletRow component. The key will unique value
- The 'children' props have not used so dont need use React.FC. If use React.FC<Props>, dont need re-define props parameter
- The 'balances' and 'prices' will receive from API. It not sure change so put it to dependecies.
- Redundant type 

*/

interface WalletBalance {
  currency: string;
  amount: number;
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {}
const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const getPriority = (blockchain: any): number => {
    switch (blockchain) {
      case "Osmosis":
        return 100;
      case "Ethereum":
        return 50;
      case "Arbitrum":
        return 30;
      case "Zilliqa":
        return 20;
      case "Neo":
        return 20;
      default:
        return -99;
    }
  };

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        if (lhsPriority > -99) {
          if (balance.amount <= 0) {
            return true;
          }
        }
        return false;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        if (leftPriority > rightPriority) {
          return -1;
        } else if (rightPriority > leftPriority) {
          return 1;
        }
      });
  }, [balances, prices]);

  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed(),
    };
  });

  const rows = sortedBalances.map(
    (balance: FormattedWalletBalance, index: number) => {
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          className={classes.row}
          key={index}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    }
  );

  return <div {...rest}>{rows}</div>;
};

// Refactored version of the code bellow

// add blockchain field in WalletBalance
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

// Define the type for usePrices
type PriceMap = Record<string, number>;

// Define the blockchain priorities
const blockchainPriorities = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

// Move getPriority to outside the component or file. It have "string" input and "number" output
const getPriority = (blockchain: string) => {
  return blockchainPriorities[blockchain] || -99;
};

const WalletPage = (props: BoxProps) => {
  const balances = useWalletBalances<WalletBalance[]>(); // balances have type: WalletBalance[]
  const prices = usePrices<PriceMap>(); // prices have type: PriceMap

  // Use memorization by balances.
  const sortedBalances = useMemo(
    () =>
      balances
        ?.filter(
          (balance) =>
            getPriority(balance?.blockchain) > -99 && balance?.amount > 0
        )
        ?.sort(
          (first, second) =>
            getPriority(first.blockchain) - getPriority(second.blockchain)
        ),
    [balances]
  );

  // render and calculate Wallet
  const renderWallets = useMemo(() => {
    return (
      <>
        {sortedBalances?.map((balance) => {
          const usdValue = (prices?.[balance?.currency] ?? 0) * balance.amount; // check price have value
          const formattedAmount = balance.amount.toFixed(2);
          return (
            <WalletRow
              key={`${balance.blockchain}_${balance.currency}`} // WalletRow should be rendered by unique key.
              className={classes.row}
              amount={balance.amount}
              usdValue={usdValue}
              formattedAmount={formattedAmount}
            />
          );
        })}
      </>
    );
  }, [sortedBalances]);

  return <div {...props}>{renderWallets}</div>;
};
