import { Request, Response } from "express";
import Errors, { HttpCode, Message } from "../libs/Error";
import { T } from "../libs/types/common";
import EventService from "../models/Event.service";
import { AdminRequest } from "../libs/types/member";
import { EventInput } from "../libs/types/event";
import path from "path";

const eventController: T = {};
const eventService = new EventService();

eventController.getAllEvents = async (req: Request, res: Response) => {
  try {
    res.set('Cache-Control', 'no-store');
    res.set('ETag', '');
    const result = await eventService.getAllEvents();
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard.code);
  }
};

eventController.getEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await eventService.getEvent(id);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard.code);
  }
};

eventController.getAllEventsAdmin = async (req: AdminRequest, res: Response) => {
  try {
    const data = await eventService.getAllEvents();
    res.render("events", { events: data });
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard.code);
  }
};

eventController.createNewEvent = async (
  req: AdminRequest,
  res: Response
) => {
  try {
    if (!req.file) {
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);
    }

    const data: EventInput = req.body;
    
    if (req.file) {
      const uploadsBasePath = path.join(process.cwd(), 'uploads');
      const relativePath = path.relative(uploadsBasePath, req.file.path);
      data.img = relativePath.replace(/\\/g, "/");
    }

    await eventService.createNewEvent(data);

    res.send(
      `<script>alert("Event created successfully"); window.location.replace('/admin/event/all') </script>`
    );
  } catch (err) {
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script>alert("${message}"); window.location.replace('/admin/event/all') </script>`
    );
  }
};

eventController.updateChosenEvent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const data: Partial<EventInput> = req.body;
    
    if (req.file) {
      const uploadsBasePath = path.join(process.cwd(), 'uploads');
      const relativePath = path.relative(uploadsBasePath, req.file.path);
      data.img = relativePath.replace(/\\/g, "/");
    }

    const result = await eventService.updateChosenEvent(id, data);

    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard.code);
  }
};

eventController.deleteChosenEvent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await eventService.deleteChosenEvent(id);
    res.status(HttpCode.OK).json({ message: "Event deleted successfully" });
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard.code);
  }
};

export default eventController;
