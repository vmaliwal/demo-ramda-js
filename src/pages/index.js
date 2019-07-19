import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import Image from "../components/image"
import SEO from "../components/seo"
import Calendar from "../components/calander";

const IndexPage = () => (
  <Layout>
    <SEO title="Home" />
    <div style={{ maxWidth: `500px`, marginBottom: `1.45rem` }}>
      <Calendar />
    </div>
  </Layout>
)

export default IndexPage
