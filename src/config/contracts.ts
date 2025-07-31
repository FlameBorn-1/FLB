// FlameBornEngine Contract Configuration
export const CONTRACT_ADDRESSES = {
  alfajores: {
    FlameBornEngine: '0x7aD2EB9BcdAd361f51574B32a794c6fD7fE0e0a6'
  }
};

export const ABI = {
  FlameBornEngine: [
    // Include relevant ABI methods here
    'function verifyActor(address actor)',
    'function donate(address donor, uint256 amount)',
    'function withdrawDonations(address payable recipient)'
  ]
};
