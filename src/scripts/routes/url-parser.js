const UrlParser = {

  // Mendapatkan path aktif dari URL hash
  getActivePathname() {
    return location.hash.replace('#', '') || '/';
  },

  // Mendapatkan rute aktif yang sudah dikonstruksi
  getActiveRoute() {
    const pathname = this.getActivePathname();
    const urlSegments = this._extractPathnameSegments(pathname);
    return this._constructRouteFromSegments(urlSegments);
  },
  
  // Mengurai path aktif menjadi segmen resource dan id
  parseActivePathname() {
    const pathname = this.getActivePathname();
    return this._extractPathnameSegments(pathname);
  },

  // Mendapatkan rute yang dikonstruksi dari pathname tertentu
  getRoute(pathname) {
    const urlSegments = this._extractPathnameSegments(pathname);
    return this._constructRouteFromSegments(urlSegments);
  },

  // Mengurai pathname tertentu
  parsePathname(pathname) {
    return this._extractPathnameSegments(pathname);
  },


  // --- Helper Methods ---

  _extractPathnameSegments(path) {
    const splitUrl = path.split('/');
    // splitUrl[0] = ""
    // splitUrl[1] = resource
    // splitUrl[2] = id

    return {
      resource: splitUrl[1] || null,
      id: splitUrl[2] || null,
    };
  },

  _constructRouteFromSegments(pathSegments) {
    let pathname = '';

    if (pathSegments.resource) {
      pathname = pathname.concat(`/${pathSegments.resource}`);
    }

    if (pathSegments.id) {
      pathname = pathname.concat('/:id');
    }

    return pathname || '/';
  },
};


export default UrlParser;