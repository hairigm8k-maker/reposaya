(function(){
  if (typeof App === 'undefined') return;

  function isStudent(){
    var u = App.user || {};
    return u.is_student === 1 || u.plan === 'student';
  }

  function blockScreen(feature){
    return '<div class="page-head"><div class="eyebrow">Restricted</div><h1 class="page-title">' + feature + '</h1><p class="page-sub">This feature is not available for student accounts.</p></div>' +
      '<div class="card" style="max-width:560px;text-align:center;padding:48px 32px">' +
        '<div style="width:64px;height:64px;border-radius:50%;background:rgba(204,145,102,.12);border:1px solid rgba(204,145,102,.3);display:flex;align-items:center;justify-content:center;margin:0 auto 20px">' +
          '<svg viewBox="0 0 24 24" style="width:28px;height:28px;stroke:#cc9166;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
        '</div>' +
        '<div style="font-family:var(--serif);font-size:24px;color:var(--white);margin-bottom:10px">Student Account</div>' +
        '<p style="color:var(--fog);font-size:14px;line-height:1.6;margin-bottom:20px">Upgrade to Pro or Bisnes plan to unlock this feature. Contact admin for more info.</p>' +
        '<a href="/dashboard/#/support" class="btn btn-primary btn-sm" style="text-decoration:none;display:inline-block">Contact Support</a>' +
      '</div>';
  }

  var origLoad = App.load.bind(App);
  App.load = function(id){
    if (isStudent()){
      if (id === 'domains') {
        return;
      }
      if (id === 'api-keys') {
        document.getElementById('content').innerHTML = blockScreen('API Keys');
        return;
      }
    }
    return origLoad(id);
  };

  App.isStudent = isStudent;
})();
