import { Request, Response } from 'express'
import { errorResponseHandler } from '../error/errors'
import { extractNivelYearFromHeaders } from '../utils/global'
import Announcements from '../models/Announcements'
import { responseOk } from '../utils/responses'

export default class AnnouncementsController {
  static async deleteAnuncio(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { anuncioId } = req.body
      await Announcements.deleteAnnouncement({ nivel, year, anuncioId })
      res.send(responseOk(null))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async fetchAnnouncements(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const anuncios = await Announcements.fetchAllAnnouncements({ nivel, year })
      res.send(responseOk(anuncios))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async addAnnouncement(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { date, title, content, userId } = req.body // _id of the empleado collection

      const response = await Announcements.addAnnouncement({ nivel, year, date, title, content, userId })
      res.send(responseOk(response.insertedId))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
}
