import { RequestHandler, Request, Response, NextFunction } from 'express'

export const wrapRequestHandler = <P>(func: RequestHandler<P, any, any, any>) => {
  return async (req: Request<P>, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

// Mong muốn nhận vào là : Request<{username:string}>
// Thực nhận là : Request<{[key:string]:string}>
