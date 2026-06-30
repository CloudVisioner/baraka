import Errors from "../libs/Error";
import EventModel from "../schema/Event.model";
import { HttpCode } from "../libs/Error";
import { Message } from "../libs/Error";
import { EventInput } from "../libs/types/event";
import { Event } from "../libs/types/event";
import { shapeIntoMongooseObjectId } from "../libs/config";

class EventService {
  private readonly eventModel;

  constructor() {
    this.eventModel = EventModel;
  }

  public async getAllEvents(): Promise<Event[]> {
    const result = await this.eventModel.find().sort({ createdAt: -1 }).exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async getEvent(id: string): Promise<Event> {
    const eventId = shapeIntoMongooseObjectId(id);
    const result = await this.eventModel.findById(eventId).exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async createNewEvent(input: EventInput): Promise<Event> {
    try {
      return await this.eventModel.create(input);
    } catch (err) {
      console.error("Error, model:createNewEvent:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async updateChosenEvent(
    id: string,
    input: Partial<EventInput>
  ): Promise<Event> {
    id = shapeIntoMongooseObjectId(id);
    const result = await this.eventModel
      .findOneAndUpdate({ _id: id }, input, { new: true })
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    return result;
  }

  public async deleteChosenEvent(id: string): Promise<Event> {
    id = shapeIntoMongooseObjectId(id);
    const result = await this.eventModel.findByIdAndDelete(id).exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }
}

export default EventService;
