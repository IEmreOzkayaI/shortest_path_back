export const loggerConfig = {
  pinoHttp: {
    customLogLevel: (res, err) => {
      // Skip logging if the error has been handled
      if (res.statusCode >= 400 && err == null) return 'info';
      return 'silent'; // cancel logging when error is handled
    },
    customProps: () => ({
      context: 'HTTP',
    }),
    serializers: {
      req(request) {
        return {
          method: request.method,
          url: request.url,
          host: request.headers.host,
          ip: request.ip || request.headers['x-forwarded-for'],
        };
      },
      res(response) {
        return {
          statusCode: response.statusCode,
          responseTime: response.responseTime,
        };
      },
    },
    transport: {
      target: 'pino-pretty',
      options: {
        ignore: 'pid,hostname',
        singleLine: true,
        colorize: true,
        translateTime: 'UTC:dd/mm/yyyy HH:mm:ss',
      },
    },
  },
};

export default loggerConfig;
