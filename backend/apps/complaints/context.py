from contextvars import ContextVar

_performed_by: ContextVar = ContextVar("performed_by", default=None)


def set_performed_by(user):
    return _performed_by.set(user)


def reset_performed_by(token):
    _performed_by.reset(token)


def get_performed_by():
    return _performed_by.get()
