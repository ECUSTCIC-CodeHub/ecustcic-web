<template>
  <div class="repair">
    <div class="page-subheader mb-30">
      <div class="container-fluid">
        <div class="row align-items-center">
          <div class="col-md-7">
            <div class="list">
              <div class="list-item pl-0">
                <div class="list-thumb ml-0 mr-3 pr-3 b-r text-muted">
                  <i class="fa fa-home"></i>
                </div>
                <div class="list-body">
                  <div class="list-title fs-2x">
                    <h3>
                      Welcome
                      <strong>{{ name }}</strong>
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-5 d-flex justify-content-end h-md-down">
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb no-padding bg-trans mb-0">
                <li class="breadcrumb-item">
                  <a href="/">
                    <i class="fa fa-home mr-2 fs14"></i>
                  </a>
                </li>
                <li class="breadcrumb-item">Admin</li>
                <li class="breadcrumb-item">Service</li>
                <li class="breadcrumb-item active">Repair</li>
              </ol>
            </nav>
          </div>
        </div>
      </div>
    </div>
    <div class="page-content">
      <div class="container-fluid">
        <div class="bg-white table-responsive rounded shadow-sm py-3 mb-30">
          <h6 class="pl-3 pr-3 text-capitalize font400 mb-20">Repair Orders</h6>
          <VdtnetTable
            class="container-fluid"
            ref="table"
            :fields="fields"
            :opts="options"
            :select-checkbox="1"
          ></VdtnetTable>
        </div>
      </div>
    </div>
    <footer class="content-footer bg-light b-t">
      <div class="d-flex flex align-items-center pl-15 pr-15">
        <div class="d-flex flex p-3 ml-auto">
          <div>
            <a href="javascript:void(0)" class="d-inline-flex pl-0 pr-2 b-r">Contact</a>
            <a href="javascript:void(0)" class="d-inline-flex pl-2 pr-2 b-r">Storage</a>
            <a href="javascript:void(0)" class="d-inline-flex pl-2 pr-2">Privacy</a>
          </div>
        </div>
        <div class="d-flex flex p-3 mr-auto justify-content-end">
          <div class="text-muted">© Copyright 2019-{{ new Date().getFullYear() }}. ECUST-CIC</div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import $ from "jquery";
export default {
  name: "repair",
  data() {
    return {
      fields: {
        id: {
          label: "ID",
          data: "id",
          sortable: true,
          defaultOrder: "asc"
        },
        name: {
          label: "Name",
          data: "name",
          sortable: true,
          searchable: true
        },
        studentNumber: {
          label: "Student Number",
          data: "student_number",
          sortable: true,
          searchable: true
        },
        description: {
          label: "Problem Description",
          data: "description",
          sortable: false,
          searchable: false
        },
        contact: {
          label: "Contact",
          data: "",
          sortable: false,
          searchable: false
        }
      },
      options: {
        ajax: {
          url: "/api/admin/service/repair",
          dataSrc: "data"
        },
        processing: true,
        searching: true,
        destroy: true,
        ordering: true,
        stateSave: true
      }
    };
  },
  computed: {
    name: function() {
      return this.$store.state.name;
    }
  },
  mounted() {
    $("#service > ul > li:nth-child(1)").addClass("mm-active");
  },
  destroyed() {
    $("#service > ul > li:nth-child(1)").removeClass("mm-active");
  }
};
</script>