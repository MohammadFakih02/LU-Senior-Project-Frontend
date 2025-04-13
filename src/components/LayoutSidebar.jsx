import { Col, Container, Row } from "react-bootstrap"
import { Outlet } from "react-router-dom";


const LayoutSidebar = ()=>{
    return(
    <Container fluid>
        <Row>
        <Col md={3} lg={2} className="min-vh-100 sticky-top bg-dark text-light p-3">
            <h1>Menu</h1>
        </Col>
            <Col><Outlet/></Col>
        </Row>
    </Container>
    )
}

export default LayoutSidebar;