// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.7.4;
import "../../interfaces/IERC1155Metadata.sol";
import "../../utils/ERC165.sol";


/**
 * @notice Contract that handles metadata related methods.
 * @dev Methods assume a deterministic generation of URI based on token IDs.
 *      Methods also assume that URI uses hex representation of token IDs.
 */
contract ERC1155Metadata is IERC1155Metadata, ERC165 {
  // URI's default URI prefix
  string private baseMetadataURI;

  // Contract metadata URL
  string private contractMetadataURI;

  // Hex numbers for creating hexadecimal tokenId
  bytes16 private constant HEX_MAP = '0123456789ABCDEF';

  // bytes4(keccak256('contractURI()')) == 0xe8a3d485
  bytes4 private constant _INTERFACE_ID_CONTRACT_URI = 0xe8a3d485;

  /***********************************|
  |     Metadata Public Function s    |
  |__________________________________*/

  /**
   * @notice A distinct Uniform Resource Identifier (URI) for a given token.
   * @dev URIs are defined in RFC 3986.
   *      URIs are assumed to be deterministically generated based on token ID
   * @return URI string
   */
  function uri(uint256 _id) public override view returns (string memory) {
    return _uri(_id, 0);
  }

  /**
   * @notice Opensea calls this fuction to get information about how to display storefront.
   *
   * @return full URI to the location of the contract metadata.
   */
  function contractURI() public view returns (string memory) {
    return contractMetadataURI;
  }

  /***********************************|
  |    Metadata Internal Functions    |
  |__________________________________*/

  /**
   * @notice Will emit default URI log event for corresponding token _id
   * @param _tokenIDs Array of IDs of tokens to log default URI
   */
  function _logURIs(uint256[] memory _tokenIDs) internal {
    for (uint256 i = 0; i < _tokenIDs.length; i++) {
      emit URI(_uri(_tokenIDs[i], 0), _tokenIDs[i]);
    }
  }

  /**
   * @notice Will update the base URL of token's URI
   * @param _newBaseMetadataURI New base URL of token's URI
   */
  function _setBaseMetadataURI(string memory _newBaseMetadataURI) internal {
    baseMetadataURI = _newBaseMetadataURI;
  }

  /**
   * @notice Will update the contract metadata URI
   * @param _newContractMetadataURI New contract metadata URI
   */
  function _setContractMetadataURI(string memory _newContractMetadataURI)
    internal
  {
    contractMetadataURI = _newContractMetadataURI;
  }

  /**
   * @notice Query if a contract implements an interface
   * @param _interfaceID  The interface identifier, as specified in ERC-165
   * @return `true` if the contract implements `_interfaceID` or CONTRACT_URI
   */
  function supportsInterface(bytes4 _interfaceID) public override virtual pure returns (bool) {
    if (
      _interfaceID == type(IERC1155Metadata).interfaceId ||
      _interfaceID == _INTERFACE_ID_CONTRACT_URI
    ) {
      return true;
    }
    return super.supportsInterface(_interfaceID);
  }


  /***********************************|
  |    Utility Internal Functions     |
  |__________________________________*/

  /**
   * @notice returns uri
   * @param tokenId Unsigned integer to convert to string
   */
  function _uri(uint256 tokenId, uint256 minLength)
    internal
    view
    returns (string memory)
  {
    // Calculate URI
    string memory baseURL = _baseMetadataURI;
    uint256 temp = tokenId;
    uint256 length = tokenId == 0 ? 2 : 0;
    while (temp != 0) {
      length += 2;
      temp >>= 8;
    }
    if (length > minLength) minLength = length;

    bytes memory buffer = new bytes(minLength);
    for (uint256 i = minLength; i > minLength - length; --i) {
      buffer[i - 1] = HEX_MAP[tokenId & 0xf];
      tokenId >>= 4;
    }
    minLength -= length;
    while (minLength > 0) buffer[--minLength] = '0';

    return string(abi.encodePacked(baseURL, buffer, '.json'));
  }
}
