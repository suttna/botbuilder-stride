export interface IAccessTokenResponse {
  access_token: string
  scope: string
  expires_in: number
  token_type: string
}

export class AccessToken {
  public static getInstance(): AccessToken {
    if (!AccessToken.instance) {
      AccessToken.instance = new AccessToken()
    }

    return AccessToken.instance
  }

  private static instance: AccessToken

  public value: string
  public expiresIn: number

  private constructor() { }

  /**
   * Returns true if the stored token in memory is still active.
   *   Stride TTL is 1 hour
   *
   * @returns {boolean}
   */
  public isValid(): boolean {
    return this.expiresIn && this.expiresIn > Date.now()
  }

  /**
   * Updates the in memory token and sets a new timestamp in expiresIn
   *
   * @param {IAccessTokenResponse} newToken
   */
  public update(newToken: IAccessTokenResponse): void {
    this.value = newToken.access_token
    this.expiresIn = Date.now() + (newToken.expires_in * 1000)
  }
}
