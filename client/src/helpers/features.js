import feature1 from "../assets/images/feature1.svg";
import feature2 from "../assets/images/feature2.svg";
import feature3 from "../assets/images/feature3.svg";

const features = [
  {
    id: 1,
    title: "Tokenized Property Listings",
    features: [
      {
        head: "Fractional Ownership",
        description: "Invest in real estate with as little as one token.",
      },
      {
        head: "Diverse Portfolio",
        description: "Create a diverse property investment portfolio.",
      },
      {
        head: "Accessibilty",
        description: "Open doors to global investors, regardless of location.",
      },
    ],
    button: "List Property Now",
    linkTo: "/sellProperty",
    imgSrc: feature1,
  },
  {
    id: 2,
    title: "Secure Blockchain Transactions",
    features: [
      {
        head: "Immutable Records",
        description:
          "Blockchain technology ensures that once a transaction is made, it cannot be altered or deleted.",
      },
      {
        head: "Enhanced Security",
        description:
          "Advanced encryption techniques protect all transactions against unauthorized access.",
      },
      {
        head: "Smart Contracts",
        description:
          "Automated execution of contracts that save time and reduce errors.",
      },
    ],
    button: "Buy Property",
    linkTo: "/auth",
    imgSrc: feature2 ,
  },
  {
    id: 3,
    title: "Real Estate Exchange",
    features: [
      {
        head: "Broker-Free Listings",
        description:
          "List and buy properties directly, bypassing traditional brokerage.",
      },
      {
        head: "Real-Time Listings",
        description:
          "Access up-to-date listings for real-time investment decisions.",
      },
      {
        head: "Global Access",
        description:
          "Buy and sell properties in different markets from a single platform.",
      },
    ],
    button: "Explore Properties",
    linkTo: "/listings",
    imgSrc: feature3 ,
  },
];

export default features;
