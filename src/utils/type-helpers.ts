/**
 * Reusable utility types for building API and form payload contracts.
 */

export type CreatePayload<
  TModel,
  RequiredKeys extends keyof TModel,
  OptionalKeys extends keyof TModel = never,
> = Pick<TModel, RequiredKeys> & Partial<Pick<TModel, OptionalKeys>>;

export type UpdatePayload<TModel, EditableKeys extends keyof TModel> = Partial<
  Pick<TModel, EditableKeys>
>;

export type WithPassword<TPayload> = TPayload & {
  password: string;
};

export type LoginPayload<TModel extends { email: string }> = Pick<
  TModel,
  "email"
> & {
  password: string;
};

export type EmailPayload<TModel extends { email: string }> = Pick<
  TModel,
  "email"
>;

export type UserTokenResponse<TUser> = {
  user: TUser;
  token: string;
};
