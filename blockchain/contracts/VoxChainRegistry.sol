// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./VoxChain.sol";

contract VoxChainRegistry {
    address public superAdmin;
    address public pendingSuperAdmin;

    enum RegistrationStatus {
        None,
        Pending,
        Approved,
        Rejected,
        Revoked
    }

    struct Organisation {
        uint256 id;
        string name;
        string description;
        string metadataURI;
        address requester;
        RegistrationStatus status;
        address admin;
        address contractAddress;
    }

    uint256 public organisationCount;
    mapping(uint256 => Organisation) public organisations;

    // Custom errors for bytecode efficiency
    error OnlySuperAdminError();
    error ZeroAddressError();
    error AlreadySuperAdminError();
    error OnlyPendingSuperAdminError();
    error NoPendingTransferError();
    error EmptyNameError();
    error EmptyDescriptionError();
    error EmptyMetadataURIError();
    error InvalidOrgIdError();
    error OrgNotPendingError();
    error InvalidAdminAddressError();
    error OrgNotActiveOrRevokedError();
    error SameAdminAddressError();
    error OrgNotActiveError();
    error AdminAlreadyRevokedError();
    error EmptyReasonError();

    event RegistrationRequested(
        uint256 indexed orgId,
        string name,
        address indexed requester,
        string metadataURI
    );

    event OrganisationApproved(
        uint256 indexed orgId,
        address indexed admin,
        address contractAddress
    );

    event OrganisationRejected(
        uint256 indexed orgId,
        string reason
    );

    event OrganisationAdminReplaced(
        uint256 indexed orgId,
        address indexed oldAdmin,
        address indexed newAdmin
    );

    event OrganisationAdminRevoked(
        uint256 indexed orgId,
        address indexed oldAdmin
    );

    event SuperAdminTransferInitiated(
        address indexed currentSuperAdmin,
        address indexed pendingSuperAdmin
    );

    event SuperAdminTransferred(
        address indexed previousSuperAdmin,
        address indexed newSuperAdmin
    );

    modifier onlySuperAdmin() {
        if (msg.sender != superAdmin) revert OnlySuperAdminError();
        _;
    }

    constructor() {
        superAdmin = msg.sender;
    }

    // ── Two-step Super Admin transfer ──

    function transferSuperAdmin(address _newSuperAdmin) external onlySuperAdmin {
        if (_newSuperAdmin == address(0)) revert ZeroAddressError();
        if (_newSuperAdmin == superAdmin) revert AlreadySuperAdminError();

        pendingSuperAdmin = _newSuperAdmin;
        emit SuperAdminTransferInitiated(superAdmin, _newSuperAdmin);
    }

    function acceptSuperAdmin() external {
        if (msg.sender != pendingSuperAdmin) revert OnlyPendingSuperAdminError();
        address previousAdmin = superAdmin;
        superAdmin = pendingSuperAdmin;
        pendingSuperAdmin = address(0);

        emit SuperAdminTransferred(previousAdmin, superAdmin);
    }

    function cancelSuperAdminTransfer() external onlySuperAdmin {
        if (pendingSuperAdmin == address(0)) revert NoPendingTransferError();
        pendingSuperAdmin = address(0);
    }

    // ── Organisation Lifecycle ──

    function requestRegistration(
        string memory _name,
        string memory _description,
        string memory _metadataURI
    ) external returns (uint256) {
        if (bytes(_name).length == 0) revert EmptyNameError();
        if (bytes(_description).length == 0) revert EmptyDescriptionError();
        if (bytes(_metadataURI).length == 0) revert EmptyMetadataURIError();

        organisationCount++;
        uint256 orgId = organisationCount;

        organisations[orgId] = Organisation({
            id: orgId,
            name: _name,
            description: _description,
            metadataURI: _metadataURI,
            requester: msg.sender,
            status: RegistrationStatus.Pending,
            admin: address(0),
            contractAddress: address(0)
        });

        emit RegistrationRequested(orgId, _name, msg.sender, _metadataURI);
        return orgId;
    }

    function approveOrganisation(
        uint256 _orgId,
        address _adminWallet
    ) external onlySuperAdmin returns (address) {
        if (_orgId == 0 || _orgId > organisationCount) revert InvalidOrgIdError();
        Organisation storage org = organisations[_orgId];
        if (org.status != RegistrationStatus.Pending) revert OrgNotPendingError();
        if (_adminWallet == address(0)) revert InvalidAdminAddressError();

        // Deploy isolated VoxChain child contract
        VoxChain electionContract = new VoxChain(
            _adminWallet,
            address(this),
            _orgId,
            org.name
        );

        address contractAddr = address(electionContract);
        org.status = RegistrationStatus.Approved;
        org.admin = _adminWallet;
        org.contractAddress = contractAddr;

        emit OrganisationApproved(_orgId, _adminWallet, contractAddr);
        return contractAddr;
    }

    function rejectOrganisation(
        uint256 _orgId,
        string memory _reason
    ) external onlySuperAdmin {
        if (_orgId == 0 || _orgId > organisationCount) revert InvalidOrgIdError();
        Organisation storage org = organisations[_orgId];
        if (org.status != RegistrationStatus.Pending) revert OrgNotPendingError();
        if (bytes(_reason).length == 0) revert EmptyReasonError();

        org.status = RegistrationStatus.Rejected;

        emit OrganisationRejected(_orgId, _reason);
    }

    function replaceOrgAdmin(
        uint256 _orgId,
        address _newAdmin
    ) external onlySuperAdmin {
        if (_orgId == 0 || _orgId > organisationCount) revert InvalidOrgIdError();
        Organisation storage org = organisations[_orgId];
        if (org.status != RegistrationStatus.Approved && org.status != RegistrationStatus.Revoked) {
            revert OrgNotActiveOrRevokedError();
        }
        if (_newAdmin == address(0)) revert InvalidAdminAddressError();
        if (_newAdmin == org.admin) revert SameAdminAddressError();

        address oldAdmin = org.admin;
        org.admin = _newAdmin;
        org.status = RegistrationStatus.Approved;

        // Atomically update the child contract
        VoxChain(org.contractAddress).setAdmin(_newAdmin);

        emit OrganisationAdminReplaced(_orgId, oldAdmin, _newAdmin);
    }

    function revokeOrgAdmin(
        uint256 _orgId
    ) external onlySuperAdmin {
        if (_orgId == 0 || _orgId > organisationCount) revert InvalidOrgIdError();
        Organisation storage org = organisations[_orgId];
        if (org.status != RegistrationStatus.Approved) revert OrgNotActiveError();
        if (org.admin == address(0)) revert AdminAlreadyRevokedError();

        address oldAdmin = org.admin;
        org.admin = address(0);
        org.status = RegistrationStatus.Revoked;

        // Atomically freeze administrative operations in the child contract
        VoxChain(org.contractAddress).setAdmin(address(0));

        emit OrganisationAdminRevoked(_orgId, oldAdmin);
    }

    // ── Inspection View Functions ──

    function getOrganisation(uint256 _orgId) external view returns (Organisation memory) {
        if (_orgId == 0 || _orgId > organisationCount) revert InvalidOrgIdError();
        return organisations[_orgId];
    }
}
