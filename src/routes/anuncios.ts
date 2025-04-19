import { Router } from 'express'
import { verifyCredentials } from '../middleware/verifyCredentials'
import AnnouncementsController from '../controllers/Announcements'

export const anunciosRouter = Router()
anunciosRouter.get('/fetch-announcements', verifyCredentials, AnnouncementsController.fetchAnnouncements)
