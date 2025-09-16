var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var error_exports = {};
module.exports = __toCommonJS(error_exports);
__reExport(error_exports, require("./CannotReflectMethodParameterTypeError"), module.exports);
__reExport(error_exports, require("./AlreadyHasActiveConnectionError"), module.exports);
__reExport(error_exports, require("./CannotConnectAlreadyConnectedError"), module.exports);
__reExport(error_exports, require("./LockNotSupportedOnGivenDriverError"), module.exports);
__reExport(error_exports, require("./ConnectionIsNotSetError"), module.exports);
__reExport(error_exports, require("./MetadataAlreadyExistsError"), module.exports);
__reExport(error_exports, require("./CannotDetermineEntityError"), module.exports);
__reExport(error_exports, require("./UpdateValuesMissingError"), module.exports);
__reExport(error_exports, require("./TreeRepositoryNotSupportedError"), module.exports);
__reExport(error_exports, require("./CustomRepositoryNotFoundError"), module.exports);
__reExport(error_exports, require("./TransactionNotStartedError"), module.exports);
__reExport(error_exports, require("./TransactionAlreadyStartedError"), module.exports);
__reExport(error_exports, require("./MustBeEntityError"), module.exports);
__reExport(error_exports, require("./OptimisticLockVersionMismatchError"), module.exports);
__reExport(error_exports, require("./LimitOnUpdateNotSupportedError"), module.exports);
__reExport(error_exports, require("./PrimaryColumnCannotBeNullableError"), module.exports);
__reExport(error_exports, require("./CustomRepositoryCannotInheritRepositoryError"), module.exports);
__reExport(error_exports, require("./QueryRunnerProviderAlreadyReleasedError"), module.exports);
__reExport(error_exports, require("./CannotAttachTreeChildrenEntityError"), module.exports);
__reExport(error_exports, require("./CustomRepositoryDoesNotHaveEntityError"), module.exports);
__reExport(error_exports, require("./NoConnectionForRepositoryError"), module.exports);
__reExport(error_exports, require("./CircularRelationsError"), module.exports);
__reExport(error_exports, require("./ReturningStatementNotSupportedError"), module.exports);
__reExport(error_exports, require("./MissingDriverError"), module.exports);
__reExport(error_exports, require("./DriverPackageNotInstalledError"), module.exports);
__reExport(error_exports, require("./CannotGetEntityManagerNotConnectedError"), module.exports);
__reExport(error_exports, require("./ConnectionNotFoundError"), module.exports);
__reExport(error_exports, require("./NoVersionOrUpdateDateColumnError"), module.exports);
__reExport(error_exports, require("./InsertValuesMissingError"), module.exports);
__reExport(error_exports, require("./OptimisticLockCanNotBeUsedError"), module.exports);
__reExport(error_exports, require("./MetadataWithSuchNameAlreadyExistsError"), module.exports);
__reExport(error_exports, require("./DriverOptionNotSetError"), module.exports);
__reExport(error_exports, require("./NamingStrategyNotFoundError"), module.exports);
__reExport(error_exports, require("./PessimisticLockTransactionRequiredError"), module.exports);
__reExport(error_exports, require("./QueryFailedError"), module.exports);
__reExport(error_exports, require("./NoNeedToReleaseEntityManagerError"), module.exports);
__reExport(error_exports, require("./PersistedEntityNotFoundError"), module.exports);
__reExport(error_exports, require("./ColumnTypeUndefinedError"), module.exports);
__reExport(error_exports, require("./QueryRunnerAlreadyReleasedError"), module.exports);
__reExport(error_exports, require("./OffsetWithoutLimitNotSupportedError"), module.exports);
__reExport(error_exports, require("./CannotExecuteNotConnectedError"), module.exports);
__reExport(error_exports, require("./NoConnectionOptionError"), module.exports);
__reExport(error_exports, require("./TypeORMError"), module.exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ...require("./CannotReflectMethodParameterTypeError"),
  ...require("./AlreadyHasActiveConnectionError"),
  ...require("./CannotConnectAlreadyConnectedError"),
  ...require("./LockNotSupportedOnGivenDriverError"),
  ...require("./ConnectionIsNotSetError"),
  ...require("./MetadataAlreadyExistsError"),
  ...require("./CannotDetermineEntityError"),
  ...require("./UpdateValuesMissingError"),
  ...require("./TreeRepositoryNotSupportedError"),
  ...require("./CustomRepositoryNotFoundError"),
  ...require("./TransactionNotStartedError"),
  ...require("./TransactionAlreadyStartedError"),
  ...require("./MustBeEntityError"),
  ...require("./OptimisticLockVersionMismatchError"),
  ...require("./LimitOnUpdateNotSupportedError"),
  ...require("./PrimaryColumnCannotBeNullableError"),
  ...require("./CustomRepositoryCannotInheritRepositoryError"),
  ...require("./QueryRunnerProviderAlreadyReleasedError"),
  ...require("./CannotAttachTreeChildrenEntityError"),
  ...require("./CustomRepositoryDoesNotHaveEntityError"),
  ...require("./NoConnectionForRepositoryError"),
  ...require("./CircularRelationsError"),
  ...require("./ReturningStatementNotSupportedError"),
  ...require("./MissingDriverError"),
  ...require("./DriverPackageNotInstalledError"),
  ...require("./CannotGetEntityManagerNotConnectedError"),
  ...require("./ConnectionNotFoundError"),
  ...require("./NoVersionOrUpdateDateColumnError"),
  ...require("./InsertValuesMissingError"),
  ...require("./OptimisticLockCanNotBeUsedError"),
  ...require("./MetadataWithSuchNameAlreadyExistsError"),
  ...require("./DriverOptionNotSetError"),
  ...require("./NamingStrategyNotFoundError"),
  ...require("./PessimisticLockTransactionRequiredError"),
  ...require("./QueryFailedError"),
  ...require("./NoNeedToReleaseEntityManagerError"),
  ...require("./PersistedEntityNotFoundError"),
  ...require("./ColumnTypeUndefinedError"),
  ...require("./QueryRunnerAlreadyReleasedError"),
  ...require("./OffsetWithoutLimitNotSupportedError"),
  ...require("./CannotExecuteNotConnectedError"),
  ...require("./NoConnectionOptionError"),
  ...require("./TypeORMError")
});
