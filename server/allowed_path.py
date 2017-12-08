class AllowedPaths(dict):
    def __init__(self) -> None:
        super().__init__()
        self._build_default_paths()

    def _build_default_paths(self):
        self["jspm_packages"] = True
        self["styles"] = True
        self["dist"] = {}
        self["dist"]["rel"] = True
        self["dist"]["src"] = True
        self["config.js"] = True
        self["public_data"] = True

    def is_allowed(self, pathstring: str):
        path_steps = pathstring.split("/")
        current_allowed = self
        for s in path_steps:
            try:
                current_allowed = current_allowed[s]
                if isinstance(current_allowed, bool):
                    return current_allowed
            except KeyError:
                return False
