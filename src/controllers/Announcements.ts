import { Request, Response } from 'express'
import { errorResponseHandler } from '../error/errors'
import { extractNivelYearFromHeaders } from '../utils/global'
import Announcements from '../models/Announcements'
import { responseOk } from '../utils/responses'

export default class AnnouncementsController {
  static async fetchAnnouncements(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const anuncios = await Announcements.fetchAllAnnouncements({ nivel, year })
      res.send(responseOk(anuncios))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
}
