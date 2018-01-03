import { IEvent } from "botbuilder"
import { IStrideEventEnvelope } from "../interfaces"
import { IStrideConnectorSettings } from "../stride_connector"

export interface IInteractorResult {
  events: IEvent[]
  response?: any
}

export abstract class BaseInteractor {
  public readonly envelope: IStrideEventEnvelope
  public readonly settings: IStrideConnectorSettings

  constructor(settings: IStrideConnectorSettings, envelope: IStrideEventEnvelope) {
    this.settings = settings
    this.envelope = envelope
  }

  public abstract async call(): Promise<IInteractorResult>

}
