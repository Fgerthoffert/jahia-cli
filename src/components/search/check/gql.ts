const query = `
query($sitekey: String!, $nodetype: String!, $querystring: String!) {
  jcr {
    searches(siteKey: $sitekey, language: "en", workspace: LIVE) {
      search(q: $querystring searchIn:[CONTENT] filter: {nodeType: {type:$nodetype}}) {
        totalHits
      }
    }
  }
}
`
export default query
